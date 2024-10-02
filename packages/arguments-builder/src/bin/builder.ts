import { ArgumentsBuilder } from '../core';
import { loadConfig } from './config';

export const getBuilder = async ({
  cwd = process.cwd(),
  path: configPath,
}: {
  cwd?: string;
  path?: string;
} = {}) => {
  const configData = await loadConfig({ cwd, path: configPath });
  if (!configData) {
    return;
  }
  const {
    config: { output, ...rest },
    configFileDir,
  } = configData;

  const builder = new ArgumentsBuilder(rest);

  return {
    builder,
    output,
    configFileDir,
  };
};
