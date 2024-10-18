import type { ModkitPlugin } from '@iringo/modkit-shared';

enum BoxJsType {
  Text = 'text',
  Slider = 'slider',
  Boolean = 'boolean',
  Textarea = 'textarea',
  Radios = 'radios',
  Checkboxes = 'checkboxes',
  ColorPicker = 'colorpicker',
  Number = 'number',
  Selects = 'selects',
  ModalSelects = 'modalSelects',
}

export interface BoxJsPluginOptions {
  scope?: string;
}

export const pluginBoxJs = <T extends Record<string, string>>({
  scope = '',
}: BoxJsPluginOptions = {}): ModkitPlugin<T> => {
  return {
    name: 'boxjs',
    setup() {
      return {
        configurePlatform() {
          return {
            extension: '.json',
            template: '<%= JSON.stringify(settings) %>',
          };
        },
        modifySource({ source }) {
          source ??= {};
          source.metadata ??= {};
          source.metadata.arguments ??= true;
          source.arguments = source.arguments?.filter((item) => {
            if (
              typeof item.type === 'object' &&
              Array.isArray(item.type.exclude) &&
              item.type.exclude.includes('boxjs')
            ) {
              return false;
            }
            return true;
          });
          return source;
        },
        processArguments({ args }) {
          const settings = args.map((arg) => {
            let type = BoxJsType.Text;
            if (typeof arg.type === 'object' && arg.type.boxJsType) {
              type = arg.type.boxJsType;
            } else {
              if (arg.type === 'boolean') {
                type = BoxJsType.Boolean;
              }
              if (arg.type === 'number') {
                type = BoxJsType.Number;
              }
              if (arg.options) {
                if (arg.type === 'array') {
                  type = BoxJsType.Checkboxes;
                } else {
                  type = BoxJsType.Selects;
                }
              }
            }

            return {
              id: `${scope ? `${scope}.` : ''}${arg.key}`,
              name: arg.name,
              type,
              val: arg.defaultValue,
              items: arg.options,
              desc: arg.description,
              placeholder: arg.placeholder,
            };
          });

          return { settings };
        },
      };
    },
  };
};
