import type { ModkitPlugin } from '@iringo/modkit-shared';
import qrcode from 'qrcode-terminal';
import { SurgeTemplate } from './template';

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
          source.arguments = source.arguments?.filter((item) => {
            if (typeof item.type === 'object' && item.type.surge === 'exclude') {
              return false;
            }
            return true;
          });
          moduleName = source.moduleName || '';
          return source;
        },
        templateParameters({ source, getScriptPath }) {
          const surgeTemplate = new SurgeTemplate(source, getScriptPath);
          const argumentsResult = surgeTemplate.handleArguments();
          return {
            ...argumentsResult,
            surgeTemplate,
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
