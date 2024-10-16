import fs from 'node:fs';
import path from 'node:path';
import { rslibConfig } from '@iringo/modkit-config/rslib.config';
import { defineConfig } from '@rslib/core';
import pkg from './package.json';

const getPluginsEntry = () => {
  const pluginDir = path.resolve('./src/plugins');
  return fs.readdirSync(pluginDir).reduce((acc, item) => {
    acc[`plugins/${path.basename(item, path.extname(item))}`] = path.resolve(pluginDir, item);
    return acc;
  }, {});
};

export default defineConfig({
  ...rslibConfig,
  source: {
    entry: {
      index: './src/index.ts',
      ...getPluginsEntry(),
    },
    define: {
      'process.env.MODKIT_VERSION': JSON.stringify(pkg.version),
    },
  },
});
