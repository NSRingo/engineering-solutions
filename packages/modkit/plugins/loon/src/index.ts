import type { ModkitPlugin } from '@iringo/modkit-shared';

export type LoonArgumentType = 'input' | 'select' | 'switch' | 'exclude';

export const pluginLoon = (): ModkitPlugin => {
  return {
    name: 'loon',
    setup() {
      return {
        configurePlatform() {
          return {
            extension: '.plugin',
            template: process.env.TEMP || '',
          };
        },
        modifySource({ source }) {
          source ??= {};
          source.arguments = source.arguments?.filter((item) => {
            if (typeof item.type === 'object' && item.type.loon === 'exclude') {
              return false;
            }
            return true;
          });
          return source;
        },
      };
    },
  };
};
