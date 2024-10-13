import path from 'node:path';
import { loadConfigFile } from '@iringo/utils';
import type { SgModuleToolsOptions } from './types';

export const loadConfig = async ({
  cwd = process.cwd(),
  path: configPath,
}: {
  cwd?: string;
  path?: string;
} = {}) => {
  const { config, configFilePath } =
    (await loadConfigFile<SgModuleToolsOptions>({
      configPath,
      baseConfigName: 'sgmodule-tools.config',
      cwd,
    })) ?? {};

  return {
    config,
    configFileDir: path.dirname(configFilePath ?? ''),
  };
};
