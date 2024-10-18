import type { ModkitPlugin } from '@iringo/modkit-shared';

export const pluginLoon = <T extends Record<string, string>>(): ModkitPlugin<T> => {
  return {
    name: 'loon',
    setup() {
      return {};
    },
  };
};
