import type { ModkitPlugin } from '@iringo/modkit-shared';
import { LoonTemplate } from './template';

export type LoonArgumentType = 'input' | 'select' | 'switch' | 'exclude';

export interface LoonPluginOptions {
  objectValuesHandler?: (obj: Record<string, any>) => string;
}

export const pluginLoon = ({
  objectValuesHandler = (obj) => {
    if (Array.isArray(obj)) {
      return `"${obj.join()}"`;
    }
    return `"${JSON.stringify(obj)}"`;
  },
}: LoonPluginOptions = {}): ModkitPlugin => {
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
        templateParameters(params) {
          const loonTemplate = new LoonTemplate(params, objectValuesHandler);
          return {
            loonTemplate,
          };
        },
      };
    },
  };
};
