import path from 'node:path';
import {
  AppContext,
  commander,
  handleArgumentsDefaultValue,
  initAppContext,
  initAppDir,
  loadConfig,
  loadPlugins,
  logger,
  manager,
  runMaybeAsync,
} from '@iringo/modkit-shared';
import express from 'express';
import minimist from 'minimist';
import { useRsbuild } from './rsbuild';

export async function initCommand() {
  logger.greet(`  ModKit v${process.env.MODKIT_VERSION}\n`);

  // 清空插件管理器中的插件
  manager.clear();

  // 使用 minimist 解析命令行参数，支持 `-c` 或 `--config` 作为配置文件参数
  const cliParams = minimist<{
    c?: string;
    config?: string;
  }>(process.argv.slice(2));

  const { program } = commander;

  // 设置 MODKIT 根目录，如果没有设置则使用当前工作目录
  process.env.MODKIT_ROOT ??= process.cwd();

  // 初始化应用程序目录
  const appDirectory = await initAppDir(process.env.MODKIT_ROOT);

  // 设置命令行工具的版本号
  program.version(process.env.MODKIT_VERSION || '0.0.0');

  // 加载配置文件，优先使用命令行指定的配置文件路径
  const { config } = await loadConfig(cliParams.config || cliParams.c);

  if (!config?.source) {
    logger.error('source config is required');
    process.exit(1);
  }

  // 加载插件，并注册到插件管理器中
  const plugins = loadPlugins(config);
  plugins.forEach((plugin) => plugin && manager.usePlugin(plugin));

  // 初始化应用程序上下文，设置应用的根目录
  const appContext = initAppContext({
    appDirectory,
  });
  AppContext.set(appContext);

  // 初始化插件管理器，执行插件的钩子函数
  const hooksRunner = await manager.init();

  const platformConfigs = hooksRunner.configurePlatform();
  // 执行一些插件钩子函数，处理平台配置、修改源代码和处理命令行参数，此处并不消费，供插件内部共享上下文
  await Promise.allSettled([
    runMaybeAsync(hooksRunner.modifySource, { source: config.source }),
    runMaybeAsync(hooksRunner.templateParameters, {
      source: config.source,
      getFilePath: () => '',
      getScriptPath: () => '',
      handleArgumentsDefaultValue,
    }),
  ]);

  // 使用自定义的 rsbuild 构建工具，初始化构建配置和插件
  const { rsbuild } = await useRsbuild({ config, plugins, appContext });

  // 定义 `build` 和 `dev` 命令
  const buildCommand = program.command('build');
  const devCommand = program.command('dev');

  // 为 `build` 和 `dev` 命令添加配置文件选项
  [buildCommand, devCommand].forEach((command) => {
    command.option('-c --config <config>', 'specify the configuration file, can be a relative or absolute path');
  });

  // 定义 `build` 命令的执行逻辑
  buildCommand.action(async () => {
    // 设置环境变量为生产环境
    process.env.NODE_ENV = 'production';

    // 执行构建任务
    await rsbuild.build();
  });

  // 定义 `dev` 命令的执行逻辑
  devCommand.action(async () => {
    // 设置环境变量为开发环境
    process.env.NODE_ENV = 'development';

    // 创建 Express 应用程序
    const app = express();

    // 在启动开发服务器之前，执行插件的钩子函数
    await runMaybeAsync(hooksRunner.onBeforeStartDevServer, { app });

    // 创建开发服务器，并将其中间件添加到 Express 应用程序中
    const rsbuildServer = await rsbuild.createDevServer();
    app
      .use((req, res, next) => {
        const ext = path.extname(req.url);
        if (platformConfigs?.map((item) => item.extension as string).includes(ext)) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
        if (ext === '.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        if (['.js', '.cjs', '.mjs'].includes(ext)) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        next();
      })
      .use(rsbuildServer.middlewares);

    // 启动 HTTP 服务器并监听端口
    const httpServer = app.listen(rsbuildServer.port, async () => {
      // 在服务器启动后执行钩子函数
      await rsbuildServer.afterListen();
    });

    // 在开发服务器启动后，执行插件的钩子函数
    await runMaybeAsync(hooksRunner.onAfterStartDevServer, { app, httpServer, rsbuildServer });
  });

  // 允许插件注册自定义命令
  await hooksRunner.commands({ program });

  // 解析命令行参数
  program.parse(process.argv);
}
