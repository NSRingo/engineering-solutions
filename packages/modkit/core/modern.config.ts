import fs from 'node:fs';
import path from 'node:path';
import { dualBuildConfigs } from '@iringo/modkit-config/modern.config.ts';
import { type PartialBaseBuildConfig, defineConfig, moduleTools } from '@modern-js/module-tools';

const getPluginsEntry = () => {
  const pluginDir = path.resolve('./src/exports-plugins');
  return fs.readdirSync(pluginDir).flatMap((plugin) => {
    return dualBuildConfigs.map((item) => {
      const config: PartialBaseBuildConfig = {
        ...item,
        input: {
          [path.basename(plugin, path.extname(plugin))]: path.resolve(pluginDir, plugin),
        },
      };
      if (!item.dts) {
        config.outDir = './dist/exports-plugins';
      }
      return config;
    });
  });
};

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [...dualBuildConfigs, ...getPluginsEntry()],
});
