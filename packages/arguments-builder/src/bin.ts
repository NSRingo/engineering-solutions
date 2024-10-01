import { bundleRequire } from '@modern-js/node-bundle-require';
import { fs, logger, program } from '@modern-js/utils';
import { z } from 'zod';
import { ArgumentsBuilder } from './core';
import { argumentsBuilderOptionsSchema } from './core/types';

const argumentsBuilderConfigSchema = argumentsBuilderOptionsSchema.extend({
  output: z
    .object({
      surge: z
        .object({
          template: z.string(),
          path: z.string().optional(),
        })
        .optional(),
      loon: z
        .object({
          template: z.string(),
          path: z.string().optional(),
        })
        .optional(),
      boxjsSettings: z
        .object({
          path: z.string().default('boxjs.settings.json').optional(),
        })
        .optional(),
      dts: z
        .object({
          path: z.string().default('./src/settings.d.ts').optional(),
        })
        .optional(),
    })
    .optional(),
});

export type ArgumentsBuilderConfig = z.infer<typeof argumentsBuilderConfigSchema>;

program
  .command('build')
  .option('-c --config <config>', 'config file')
  .action(async (option) => {
    const configPath = [
      option.config,
      'arguments-builder.config.js',
      'arguments-builder.config.mjs',
      'arguments-builder.config.ts',
    ].find((item) => fs.existsSync(item));

    if (!configPath) {
      logger.error('未找到配置文件');
      return;
    }
    const config = await bundleRequire(configPath);
    const resp = argumentsBuilderConfigSchema.safeParse(config.default);

    if (!resp.success) {
      logger.error('配置文件有误', resp.error);
      return;
    }
    const { output, ...rest } = resp.data;
    const argumentsBuilder = new ArgumentsBuilder(rest);

    const [surgeResult, loonResult, boxjsSettingsResult, dtsResult] = await Promise.allSettled([
      argumentsBuilder.buildSurgeArguments(),
      argumentsBuilder.buildLoonArguments(),
      argumentsBuilder.buildBoxJsSettings(),
      argumentsBuilder.buildDtsArguments(),
    ]);

    // if (surgeResult.status === 'fulfilled') {
    //   const surgeOutput = output?.surge;
    //   if (surgeOutput) {
    //     const { path = 'modules/surge.sgmodule', template } = surgeOutput;

    //   } else {
    //     logger.info('未配置 surge 输出');
    //   }
    // }
  });

program.parse(process.argv);
