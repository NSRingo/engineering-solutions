import { loadConfigFile, lodash, logger } from '@iringo/utils';
import type { ModkitConfig } from './types';

export function defineConfig<ScriptInput extends Record<string, string>>(
  config: ModkitConfig<ScriptInput> | (() => ModkitConfig<ScriptInput>),
): ModkitConfig<ScriptInput> {
  if (typeof config === 'function') {
    return config();
  }
  return config;
}

const getDefaultConfig = (): ModkitConfig<any> => {
  const root = process.env.MODKIT_ROOT || process.cwd();

  let packageJson: any = {};
  try {
    packageJson = require(`${root}/package.json`);
  } catch (e) {
    // ignore
  }

  return {
    source: {
      metadata: {
        name: packageJson.displayName || packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
      },
    },
    output: {
      distPath: {
        root: 'dist',
      },
    },
  };
};

export const loadConfig = async (
  configPath?: string,
): Promise<{
  config: ModkitConfig<any>;
  configFilePath: string;
}> => {
  const resp = await loadConfigFile<ModkitConfig<any>>({
    configPath,
    baseConfigName: 'modkit.config',
    cwd: process.env.MODKIT_ROOT || process.cwd(),
  });
  if (!resp) {
    logger.error('未找到配置文件');
    process.exit(1);
  }
  const { config, configFilePath } = resp;
  const defaultConfig = getDefaultConfig();
  return {
    config: lodash.merge(defaultConfig, config),
    configFilePath,
  };
};
