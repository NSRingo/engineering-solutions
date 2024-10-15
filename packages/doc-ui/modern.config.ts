import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: ({ extendPreset }) =>
    extendPreset('npm-component', {
      asset: {
        svgr: true,
        path: '../assets',
      },
    }),
});
