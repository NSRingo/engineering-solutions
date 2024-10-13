import { loadConfigFile } from '@iringo/utils';
import type { SgModuleToolsOptions } from './types';

export const loadConfig = async ({
  cwd = process.cwd(),
  path: configPath,
}: {
  cwd?: string;
  path?: string;
} = {}) => {
  return loadConfigFile<SgModuleToolsOptions>({
    configPath,
    baseConfigName: 'sgmodule-tools.config',
    cwd,
  });
};
