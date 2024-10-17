import type { ModkitPlugin } from '@iringo/modkit-shared';

export const pluginSurge = <T extends Record<string, string>>(): ModkitPlugin<T> => {
  return {
    name: 'surge',

    platformConfig: {
      extension: 'sgmodule',
    },

    setup() {
      return {
        modifySource({ source }) {
          source ??= {};
          source.metadata ??= {};
          source.metadata.arguments ??= true;
          return source;
        },
      };
    },
  };
};
