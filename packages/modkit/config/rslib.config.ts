import { defineConfig } from '@rslib/core';

export const rslibConfig = defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: { bundle: false },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      banner: {
        js: [`import { createRequire } from 'module';`, `var require = createRequire(import.meta['url']);`, ''].join(
          '\n',
        ),
      },
    },
  ],
  output: {
    target: 'node',
  },
});
