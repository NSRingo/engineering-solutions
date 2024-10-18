import type { ModkitPlugin } from '@iringo/modkit-shared';
import qrcode from 'qrcode-terminal';

function getDefaultValue(defaultValue: any): any {
  switch (typeof defaultValue) {
    case 'string':
      return `"${defaultValue}"`;
    case 'number':
    case 'boolean':
      return defaultValue;
    case 'object':
      if (Array.isArray(defaultValue) && defaultValue.length > 0) {
        return getDefaultValue(defaultValue[0]);
      }
      return '""';
    default:
      return '""';
  }
}

export const pluginSurge = <T extends Record<string, string>>(): ModkitPlugin<T> => {
  return {
    name: 'surge',

    setup(api) {
      const appContext = api.useAppContext();
      let moduleName = '';
      return {
        configurePlatform() {
          return {
            extension: '.sgmodule',
            template: process.env.TEMP || '',
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
              item.type.exclude.includes('surge')
            ) {
              return false;
            }
            return true;
          });
          moduleName = source.moduleName || '';
          return source;
        },
        processArguments({ args }) {
          const argumentsText = args.map((arg) => `${arg.key}:${getDefaultValue(arg.defaultValue)}`).join(',');

          const argumentsDescription = args
            .map((arg) => {
              let result = arg.key;
              if (arg.name) {
                result += `: ${arg.name}`;
              }
              if (arg.options?.length) {
                result += '\n';
                result += arg.options
                  .map((option, index, array) => {
                    const prefix = index === array.length - 1 ? '└' : '├';
                    return `    ${prefix} ${option.key}: ${option.label ?? option.key}`;
                  })
                  .join('\n');
              }
              if (arg.description) {
                result += `\n${arg.description}`;
              }
              result += '\n';
              return result;
            })
            .join('\n')
            .replace(/\n/g, '\\n');

          const scriptParams = args.map((item) => `${item.key}={{{${item.key}}}}`).join('&');

          return {
            argumentsText,
            argumentsDescription,
            scriptParams,
          };
        },

        onAfterStartDevServer({ rsbuildServer }) {
          const moduleRemoteUrl = `http://${appContext.ip}:${rsbuildServer.port}/${moduleName}.sgmodule`;
          qrcode.generate(`surge:///install-module?url=${encodeURIComponent(moduleRemoteUrl)}`, { small: true });
          api.logger.ready('Scan the QR code to install the module, or manually import:', moduleRemoteUrl);
        },
      };
    },
  };
};
