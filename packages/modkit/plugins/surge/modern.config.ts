import fs from 'node:fs';
import { dualBuildConfigs } from '@iringo/modkit-config/modern.config.ts';
import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: dualBuildConfigs.map((item) => ({
    ...item,
    define: {
      'process.env.TEMP': fs.readFileSync('./template.ejs', 'utf-8'),
    },
  })),
});
