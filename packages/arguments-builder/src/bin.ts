import { bundleRequire } from '@modern-js/node-bundle-require';
import { fs, logger, program } from '@modern-js/utils';
import { z } from 'zod';
import { argumentsBuilderOptionsSchema } from './core/types';

const argumentsBuilderConfigSchema = argumentsBuilderOptionsSchema.extend({
  output: z
    .object({
      surge: z
        .object({
          template: z.string().optional(),
          path: z.string().optional(),
        })
        .or(z.boolean())
        .optional(),
      loon: z
        .object({
          template: z.string().optional(),
          path: z.string().optional(),
        })
        .or(z.boolean())
        .optional(),
      boxjsSettings: z
        .object({
          path: z.string().optional(),
        })
        .or(z.boolean())
        .optional(),
      dts: z
        .object({
          path: z.string().optional(),
        })
        .or(z.boolean())
        .optional(),
    })
    .optional(),
});

export type ArgumentsBuilderConfig = z.infer<typeof argumentsBuilderConfigSchema>;

program
  .command('build')
  .option('-c --config <config>', 'config file')
  .action(async (option) => {
    let config: {default: ArgumentsBuilderConfig}
    if (option.config && fs.existsSync(option.config)) {
      config = await bundleRequire(option.config);
    } else {
      config = await Promise.race(
        ['arguments-builder.config.js', 'arguments-builder.config.mjs', 'arguments-builder.config.ts'].map(
          async (file) => bundleRequire(file),
        ),
      );
    }
    if (!config?.default) {
      logger.error('未找到配置文件');
      return;
    }
    const resp= argumentsBuilderConfigSchema.safeParse(config.default)
    
    console.log(resp)
  });

program.parse(process.argv);
