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

const getFilePathFactory = (assetPrefix = '') => {
  const isDev = process.env.NODE_ENV === 'development';
  return (filePath: string) => {
    let result = filePath;
    if (assetPrefix) {
      result = `${assetPrefix}/${filePath}`;
    }
    if (isDev) {
      result += `?t=${Date.now()}`;
    }
    return result;
  };
};

const getScriptPathFactory = (compilation: Compilation, assetPrefix = '') => {
  const entrypoints = compilation.getStats().toJson({ assets: true }).entrypoints;
  const getFilePath = getFilePathFactory(assetPrefix);
  return (scriptKey: string) => {
    const filePath = entrypoints?.[scriptKey]?.assets?.[0].name;
    if (!filePath) {
      return '';
    }
    return getFilePath(filePath);
  };
};

const generateEnvironment = async ({
  plugin,
  config,
  appContext,
}: { plugin: PluginType; config: ModkitConfig; appContext: IAppContext }): Promise<{
  name: string;
  rsbuildConfig: RsbuildConfig;
} | null> => {
  const { cacheDirectory } = appContext;
  if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory);
  }

  const rsbuildConfig: EnvironmentConfig = {
    html: {
      inject: false,
    },
  };

  const pluginCtx = await getPluginContext(plugin);

  const platformConfig = pluginCtx.configurePlatform?.();
  if (!platformConfig) {
    return null;
  }

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
  rsbuildConfig.html.templateParameters = (defaultParameters) => {
    const compilation = defaultParameters.compilation as Compilation;
    const assetPrefix = defaultParameters.assetPrefix as string;
    const getFilePath = getFilePathFactory(assetPrefix);
    const getScriptPath = getScriptPathFactory(compilation, assetPrefix);
    const params = pluginCtx.templateParameters?.({ source, getFilePath, getScriptPath });
    return {
      ...source,
      ...params,
      getFilePath,
      getScriptPath,
    };
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
  config: ModkitConfig;
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

  const assetsOutput = config.output?.distPath?.assets ?? 'static';
  const assetsCopy = Object.entries(config.source?.assets ?? {}).map(([outputName, from]) => ({
    from,
    to: path.join(assetsOutput, outputName),
  }));

  const rsbuild = await createRsbuild({
    rsbuildConfig: {
      source: {
        entry: config.source?.scripts,
      },
      output: {
        assetPrefix: config.output?.assetPrefix,
        distPath: {
          root: config.output?.distPath?.root,
          js: config.output?.distPath?.js,
        },
        filename: {
          js: '[name].js',
        },
        copy: assetsCopy,
      },
      dev: {
        assetPrefix: `http://${address.ip()}:${config.dev?.port ?? 3000}`,
        hmr: false,
        liveReload: false,
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
