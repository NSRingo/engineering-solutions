import type { ModkitPlugin } from '@iringo/modkit-shared';
import { QuantumultxTemplate } from './template';

export interface QuantumultxPluginOptions {
  objectValuesHandler?: (obj: Record<string, any>) => string;
}

export const pluginQuantumultx = ({
  objectValuesHandler = (obj) => {
    if (Array.isArray(obj)) {
      return `"${obj.join()}"`;
    }
    return `"${JSON.stringify(obj)}"`;
  },
}: QuantumultxPluginOptions = {}): ModkitPlugin => {
  return {
    name: 'quantumultx',
    setup() {
      return {
        configurePlatform() {
          return {
            extension: '.snippet',
            template: process.env.TEMP || '',
          };
        },
        modifySource({ source }) {
          source ??= {};
          source.arguments = source.arguments?.filter((item) => {
            if (typeof item.type === 'object' && item.type.quantumultx === 'exclude') {
              return false;
            }
            return true;
          });
          return source;
        },
        templateParameters(params) {
          const quantumultxTemplate = new QuantumultxTemplate(params, objectValuesHandler);
          return {
            quantumultxTemplate,
          };
        },
      };
    },
  };
};
