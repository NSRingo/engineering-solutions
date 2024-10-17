import { defineConfig } from '@iringo/modkit';
import { pluginSurge } from '@iringo/modkit/plugins/surge';

export default defineConfig({
  source: {
    scripts: {
      index: './src/index.ts',
    },
  },
  plugins: [pluginSurge() as any],
});
