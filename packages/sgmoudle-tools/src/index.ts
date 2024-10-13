import { commander } from '@iringo/utils';
import { loadConfig } from './config';
import { startServerFactory } from './server';
import type { SgModuleToolsOptions } from './types';

export function initCommand() {
  const { program } = commander;
  program
    .command('dev')
    .description('Start a development sgmodule')
    .option('-p, --port <port>', 'specify the port')
    .option('-c, --config <config>', 'specify the configuration file')
    .action(async (option) => {
      const { config, configFilePath } = (await loadConfig({ path: option.config })) ?? {};
      if (!config || !configFilePath) {
        return;
      }
      if (option.port) {
        config.port = option.port;
      }
      config.port ??= 0;
      const startServer = startServerFactory(config, configFilePath);
      startServer();
    });

  program.parse(process.argv);
}

export function defineConfig(config: SgModuleToolsOptions) {
  return config;
}
