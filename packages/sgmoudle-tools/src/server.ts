import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { address } from '@iringo/utils';
import express from 'express';
import { cloneDeep } from 'lodash';
import qrcode from 'qrcode-terminal';
import { logger } from 'rslog';
import { loadConfig } from './config';
import type { SgModuleToolsOptions } from './types';
import { generateSgModule } from './utils';

export function startServerFactory(config: SgModuleToolsOptions, configFilePath: string) {
  const configFileDir = path.dirname(configFilePath);
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(configFileDir, 'package.json'), 'utf-8'));
  const name = packageJson.name ?? 'sgmodule';
  const modulePath = `/${name}.sgmodule`;
  let module = cloneDeep(config.module);

  fs.watch(configFilePath, async (eventType) => {
    if (eventType === 'change') {
      logger.start('配置文件发生变化，重新加载配置...');
      const newConfig = await loadConfig({ path: configFilePath });
      if (newConfig) {
        config.module = newConfig.config.module;
        module = cloneDeep(config.module);
        logger.ready('重新加载配置成功');
      }
    }
  });

  return (differentPort = true) => {
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
      if (differentPort) {
        config.port = (server.address() as AddressInfo)?.port;
        const moduleRemoteUrl = `http://${address.ip()}:${config!.port}${modulePath}`;
        qrcode.generate(`surge:///install-module?url=${encodeURIComponent(moduleRemoteUrl)}`, { small: true });
        logger.ready('扫码安装模块，或手动导入：', moduleRemoteUrl);
      }
    });

    return server;
  };
}
