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
        configurePlatform({ source }) {
          const surgeTemplate = new SurgeTemplate(source);
          return {
            extension: '.sgmodule',
            template: surgeTemplate.renderTemplate(),
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
        onAfterStartDevServer({ rsbuildServer }) {
          const moduleRemoteUrl = `http://${appContext.ip}:${rsbuildServer.port}/${moduleName}.sgmodule`;
          qrcode.generate(`surge:///install-module?url=${encodeURIComponent(moduleRemoteUrl)}`, { small: true });
          api.logger.ready('Scan the QR code to install the module, or manually import:', moduleRemoteUrl);
        },
      };
    },
  };
};
