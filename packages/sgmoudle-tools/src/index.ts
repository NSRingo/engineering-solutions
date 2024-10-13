import fs from 'node:fs';
import path from 'node:path';

import { address, commander } from '@iringo/utils';
import express from 'express';
import qrcode from 'qrcode-terminal';
import { logger } from 'rslog';
import type { SgModuleToolsOptions } from './types';

import { cloneDeep } from 'lodash';
import { loadConfig } from './config';
import { generateSgModule } from './utils';

export function initCommand() {
  const { program } = commander;
  program
    .command('dev')
    .description('Start a development sgmodule')
    .option('-p, --port <port>', 'specify the port')
    .option('-c, --config <config>', 'specify the configuration file')
    .action(async (option) => {
      const { config, configFileDir } = await loadConfig(option.config);
      if (!config) {
        process.exit(1);
      }
      if (option.port) {
        config.port = option.port;
      }
      const packageJson = JSON.parse(fs.readFileSync(path.resolve(configFileDir, 'package.json'), 'utf-8'));
      const name = packageJson.name ?? 'sgmodule';
      const modulePath = `/${name}.sgmodule`;
      const module = cloneDeep(config.module);

      const app = express();

      config.module?.script?.forEach((script, index) => {
        const scriptPath = path.resolve(configFileDir, script.scriptPath);
        const routePath = `/${name}/${path.relative(configFileDir, scriptPath)}`;
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
      const server = app.listen(config.port, () => {
        const moduleRemoteUrl = `http://${address.ip()}:${(server.address() as any)?.port}${modulePath}`;
        qrcode.generate(`surge:///install-module?url=${encodeURIComponent(moduleRemoteUrl)}`, { small: true });
        logger.ready('扫码安装模块，或手动导入：', moduleRemoteUrl);
      });
    });

  program.parse(process.argv);
}

export function defineConfig(config: SgModuleToolsOptions) {
  return config;
}
