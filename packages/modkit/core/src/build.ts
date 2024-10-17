import { type ModkitConfig, type ModkitPlugin, address, getPluginContext } from '@iringo/modkit-shared';
import { type RsbuildConfig, createRsbuild, mergeRsbuildConfig } from '@rsbuild/core';
import type { loadPlugins } from './load-plugins';

export const useRsbuild = async (config: ModkitConfig<any>, plugins: ReturnType<typeof loadPlugins>) => {
  const environments: RsbuildConfig['environments'] = {};

  await Promise.allSettled(
    plugins.map(async (plugin) => {
      const { platformConfig } = plugin as unknown as ModkitPlugin<any>;
      if (!platformConfig) {
        return;
      }
      const pluginCtx = await getPluginContext(plugin);
      const source = pluginCtx.modifySource?.({ source: config.source });
      environments[plugin.name] = {
        output: {
          filename: {
            html: `${config.source?.moduleName}.${platformConfig.extension}`,
          },
        },
      };
    }),
  );

  const rsbuild = await createRsbuild({
    rsbuildConfig: {
      output: {
        assetPrefix: config.output?.assetPrefix,
        distPath: {
          root: config.output?.distPath?.root,
        },
      },
      dev: {
        assetPrefix: `http://${address.ip()}:${config.dev?.port ?? 3000}`,
      },
      environments,
    },
  });

  return {
    rsbuild,
  };
};
