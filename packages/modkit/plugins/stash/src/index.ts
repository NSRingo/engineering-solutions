import type { ModkitPlugin } from '@iringo/modkit-shared';
import { StashTemplate } from './template';

export const pluginStash = (): ModkitPlugin => {
  return {
    name: 'stash',
    setup() {
      return {
        configurePlatform() {
          return {
            extension: '.stoverride',
            template: '<%= stashTemplate.output %>',
          };
        },
        modifySource({ source }) {
          source ??= {};
          source.arguments = source.arguments?.filter((item) => {
            if (typeof item.type === 'object' && item.type.stash === 'exclude') {
              return false;
            }
            return true;
          });
          return source;
        },
        templateParameters(params) {
          const stashTemplate = new StashTemplate(params);
          return {
            stashTemplate,
          };
        },
      };
    },
  };
};
