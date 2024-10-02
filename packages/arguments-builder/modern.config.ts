import { defineConfig, moduleTools } from '@modern-js/module-tools';
import { version } from './package.json';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: ({ extendPreset }) =>
    extendPreset('npm-library', {
      input: {
        index: './src/index.ts',
        bin: './src/bin/index.ts',
      },
      splitting: true,
      define: {
        'process.env.VERSION': version,
      },
    }),
});
