import type { ModkitPlugin } from '@iringo/modkit-shared';

export const pluginLoon = (): ModkitPlugin => {
  return {
    name: 'loon',
    setup() {
      return {};
    },
  };
};
