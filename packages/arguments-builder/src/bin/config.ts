import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { logger } from 'rslog';
import { z } from 'zod';
import { argumentsBuilderOptionsSchema } from '../core/types';

const outputSchema = z.object({
  surge: z
    .object({
      template: z.string().optional(),
      path: z.string().optional(),
    })
    .optional(),
  loon: z
    .object({
      template: z.string().optional(),
      path: z.string().optional(),
    })
    .optional(),
  boxjsSettings: z
    .object({
      scope: z.string().optional(),
      path: z.string().default('boxjs.settings.json').optional(),
    })
    .optional(),
  dts: z
    .object({
      path: z.string().default('./src/settings.d.ts').optional(),
      isExported: z.boolean().optional(),
    })
    .optional(),
  customItems: z
    .array(
      z.object({
        template: z.string(),
        path: z.string(),
      }),
    )
    .optional(),
});

export type Output = z.infer<typeof outputSchema>;

const argumentsBuilderConfigSchema = argumentsBuilderOptionsSchema.extend({
  output: outputSchema.optional(),
});

export type ArgumentsBuilderConfig = z.infer<typeof argumentsBuilderConfigSchema>;

export const loadConfig = async ({
  cwd = process.cwd(),
  path: configPath,
}: {
  cwd?: string;
  path?: string;
} = {}) => {
  const configFilePath = [
    configPath,
    'arguments-builder.config.js',
    'arguments-builder.config.mjs',
    'arguments-builder.config.cjs',
    'arguments-builder.config.ts',
    'arguments-builder.config.mts',
    'arguments-builder.config.cts',
  ]
    .filter(Boolean)
    .map((item) => path.resolve(cwd, item ?? ''))
    .find((item) => fs.existsSync(item));

  if (!configFilePath) {
    logger.error('未找到配置文件');
    return;
  }

  let config: ArgumentsBuilderConfig | undefined;

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

      config = (await jiti.import(configFilePath)) as ArgumentsBuilderConfig;
    }
  } catch (err) {
    logger.error(`Failed to load file with jiti: ${configFilePath}`);
    throw err;
  }

  const result = argumentsBuilderConfigSchema.safeParse(config);

  if (!result.success) {
    logger.error('配置文件有误', result.error);
    return;
  }

  return {
    config: result.data,
    configFileDir: path.dirname(configFilePath),
  };
};
