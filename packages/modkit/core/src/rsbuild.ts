import fs from 'node:fs';
import path from 'node:path';
import {
  type IAppContext,
  type ModkitConfig,
  type PluginType,
  address,
  getPluginContext,
  lodash,
  runMaybeAsync,
} from '@iringo/modkit-shared';
import { type EnvironmentConfig, type RsbuildConfig, createRsbuild } from '@rsbuild/core';
import type { Compilation } from '@rspack/core';

const getScriptPath = (compilation: Compilation, scriptKey: string, assetPrefix = '') => {
  const isDev = process.env.NODE_ENV === 'development';
  const filePath = compilation.getStats().toJson({ assets: true }).entrypoints?.[scriptKey]?.assets?.[0].name;
  let result = filePath;
  if (assetPrefix) {
    result = `${assetPrefix}/${filePath}`;
  }
  if (isDev) {
    result += `?t=${Date.now()}`;
  }
  return result;
};

const generateEnvironment = async ({
  plugin,
  config,
  appContext,
}: { plugin: PluginType; config: ModkitConfig<Record<string, string>>; appContext: IAppContext }): Promise<{
  name: string;
  rsbuildConfig: RsbuildConfig;
} | null> => {
  const { cacheDirectory } = appContext;
  if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory);
  }
  /**
   * 不能用完整的 `RsbuildConfig`，类型存在递归，下方类型推断会造成内存溢出
   */
  const rsbuildConfig: EnvironmentConfig = {
    html: {
      inject: false,
    },
  };

  const pluginCtx = await getPluginContext(plugin);
  if (!pluginCtx.configurePlatform) {
    return null;
  }
  const platformConfig = pluginCtx.configurePlatform();

  // 注入模板
  const templatePath = path.resolve(cacheDirectory, `${plugin.name}.ejs`);
  await fs.promises.writeFile(templatePath, platformConfig.template);
  rsbuildConfig.html ??= {};
  rsbuildConfig.html.template = templatePath;

  // 处理 source
  const sourceBackup = lodash.cloneDeep(config.source);
  const source = (await runMaybeAsync(pluginCtx.modifySource, { source: sourceBackup })) ?? sourceBackup;

  // 设置输出模块名
  const moduleFilename = `${source?.moduleName}${platformConfig.extension}`;
  rsbuildConfig.output ??= {};
  rsbuildConfig.output.filename ??= {};
  rsbuildConfig.output.filename.html = moduleFilename;

  // 设置模板参数
  const argsCtx = await runMaybeAsync(pluginCtx.processArguments, { args: source?.arguments ?? [] });
  rsbuildConfig.html.templateParameters = {
    ...argsCtx,
    ...source,
  };

  return {
    name: plugin.name,
    rsbuildConfig,
  };
};

export const useRsbuild = async ({
  config,
  plugins,
  appContext,
}: {
  config: ModkitConfig<Record<string, string>>;
  plugins: PluginType[];
  appContext: IAppContext;
}) => {
  const environments: RsbuildConfig['environments'] = {};

  await Promise.allSettled(
    plugins.map((plugin) =>
      generateEnvironment({ plugin, config, appContext }).then((result) => {
        if (result) {
          environments[result.name] = result.rsbuildConfig;
        }
      }),
    ),
  );

  const rsbuild = await createRsbuild({
    rsbuildConfig: {
      source: {
        entry: config.source?.scripts,
      },
      output: {
        assetPrefix: config.output?.assetPrefix,
        distPath: {
          root: config.output?.distPath?.root,
          js: '',
        },
        filename: {
          js: '[name].js',
        },
      },
      dev: {
        assetPrefix: `http://${address.ip()}:${config.dev?.port ?? 3000}`,
      },
      html: {
        templateParameters: {
          getScriptPath,
        },
      },
      performance: {
        chunkSplit: {
          strategy: 'all-in-one',
        },
      },
      server: {
        printUrls: false,
      },
      environments,
      tools: config.tools,
    },
  });

  return {
    rsbuild,
  };
};
