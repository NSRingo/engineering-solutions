import { buildConfig } from '@iringo/modkit-config/modern.config.ts';
import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: {
    ...buildConfig,
  },
});
