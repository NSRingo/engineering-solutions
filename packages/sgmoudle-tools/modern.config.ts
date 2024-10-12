import fs from 'node:fs';
import { type PartialBaseBuildConfig, defineConfig, moduleTools } from '@modern-js/module-tools';

const shared: PartialBaseBuildConfig = {};

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      buildType: 'bundleless',
      format: 'cjs',
      target: 'es2019',
      outDir: './dist',
      externalHelpers: true,
      define: {
        'process.env.MODULE_TEMP': fs.readFileSync('./sgmodule.handlebars', 'utf-8'),
      },
    },
  ],
});
