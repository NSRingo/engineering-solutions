import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { logger } from 'rslog';

export async function loadConfigFile<T = any>({
  configPath,
  baseConfigName,
  cwd = process.cwd(),
}: { configPath?: string; baseConfigName?: string; cwd?: string } = {}) {
  const configFilePath = [
    configPath,
    `${baseConfigName}.js`,
    `${baseConfigName}.mjs`,
    `${baseConfigName}.cjs`,
    `${baseConfigName}.ts`,
    `${baseConfigName}.mts`,
    `${baseConfigName}.cts`,
  ]
    .filter(Boolean)
    .map((item) => path.resolve(cwd, item ?? ''))
    .find((item) => fs.existsSync(item));

  if (!configFilePath) {
    logger.error('未找到配置文件');
    return;
  }

  let config: T | undefined;

  if (/\.(?:js|mjs|cjs)$/.test(configFilePath)) {
    try {
      const exportModule = await import(`${configFilePath}?t=${Date.now()}`);
      config = exportModule.default ? exportModule.default : exportModule;
    } catch (err) {
      logger.debug(`Failed to load file with dynamic import: ${configFilePath}`);
    }
  }

  try {
    if (!config) {
      const jiti = createJiti(__filename, {
        requireCache: false,
        interopDefault: true,
      });

      config = (await jiti.import(configFilePath)) as T;
    }
  } catch (err) {
    logger.error(`Failed to load file with jiti: ${configFilePath}`);
    throw err;
  }

  return { config, configFilePath };
}
