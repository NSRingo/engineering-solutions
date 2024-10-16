import fs from 'node:fs';
import path from 'node:path';
import { dualBuildConfigs } from '@iringo/modkit-config/modern.config.ts';
import {
  type BaseBuildConfig,
  type CliPlugin,
  type ModuleTools,
  defineConfig,
  moduleTools,
} from '@modern-js/module-tools';

const getPluginsEntry = () => {
  const pluginDir = path.resolve('./src/plugins');
  return fs.readdirSync(pluginDir).reduce((acc, item) => {
    acc[`__plugins__.${path.basename(item, path.extname(item))}`] = path.resolve(pluginDir, item);
    return acc;
  }, {});
};

const mvPlugins = (): CliPlugin<ModuleTools> => {
  return {
    name: 'mv_plugins',
    setup() {
      return {
        afterBuild({ config }) {
          const handleConfig = (config: BaseBuildConfig) => {
            const pluginsOutDir = path.resolve(config.outDir, 'plugins');
            if (!fs.existsSync(pluginsOutDir)) {
              fs.mkdirSync(pluginsOutDir);
            }
            fs.readdirSync(config.outDir).forEach((file) => {
              if (file.startsWith('__plugins__.')) {
                fs.renameSync(
                  path.resolve(config.outDir, file),
                  path.resolve(pluginsOutDir, file.replace('__plugins__.', '')),
                );
              }
            });
          };
          if (Array.isArray(config)) {
            config.forEach(handleConfig);
          } else {
            handleConfig(config);
          }
        },
      };
    },
  };
};

export default defineConfig({
  plugins: [moduleTools(), mvPlugins()],
  buildConfig: dualBuildConfigs.map((config) => ({
    ...config,
    input: {
      index: './src/index.ts',
      ...getPluginsEntry(),
    },
  })),
});
