import fs from 'node:fs';
import path from 'node:path';
import type { CliPlugin, ModuleTools } from '@modern-js/module-tools';
import express from 'express';
import qrcode from 'qrcode-terminal';
import { logger } from 'rslog';
import type { SgModuleToolsOptions } from './types';

import { cloneDeep } from 'lodash';
import { generateSgModule } from './utils';

export const pluginSgModuleTools = (options: SgModuleToolsOptions): CliPlugin<ModuleTools> => {
  options.port ??= 0;
  return {
    name: 'sgmodule-tools',

    setup: (api) => {
      const appContext = api.useAppContext();

      return {
        beforeBuild: async () => {
          const packageJson = JSON.parse(
            fs.readFileSync(path.resolve(appContext.appDirectory, 'package.json'), 'utf-8'),
          );
          const name = packageJson.name.split('/').pop();
          const app = express();
          const modulePath = `/${name}.sgmodule`;

          const module = cloneDeep(options.module);

          options.module?.script?.forEach((script, index) => {
            const scriptPath = path.resolve(appContext.appDirectory, script.scriptPath);
            const routePath = `/${name}/${path.relative(appContext.appDirectory, scriptPath)}`;
            app.get(routePath, (req, res) => {
              res.sendFile(scriptPath);
            });
            if (module?.script) {
              module.script[index].scriptPath = routePath;
            }
          });

          app.get(modulePath, (req, res) => {
            const protocol = req.protocol;
            const host = req.get('host');
            module?.script?.forEach((script) => {
              script.scriptPath = `${protocol}://${host}${script.scriptPath}?${Date.now()}`;
            });
            res.send(
              generateSgModule({
                name,
                module,
              }),
            );
          });
          const server = app.listen(options.port, () => {
            const moduleRemoteUrl = `http://${appContext.ip}:${(server.address() as any)?.port}${modulePath}`;
            qrcode.generate(`surge:///install-module?url=${encodeURIComponent(moduleRemoteUrl)}`, { small: true });
            logger.ready('扫码安装模块，或手动导入：', moduleRemoteUrl);
          });
        },
      };
    },
  };
};
