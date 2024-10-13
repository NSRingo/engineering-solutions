import { defineConfig } from '.';

export default defineConfig({
  module: {
    mitm: {
      hostname: ['www.baidu.com'],
    },
  },
});
