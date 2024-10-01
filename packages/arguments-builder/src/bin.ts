import { program } from '@modern-js/utils';
import { z } from 'zod';
import { argumentsBuilderOptionsSchema } from './core/types';

const argumentsBuilderConfigSchema = argumentsBuilderOptionsSchema.extend({
  output: z.object({
    surge: z.object({
      template: z.string().optional(),
      path: z.string().optional(),
    }),
    loon: z.object({
      template: z.string().optional(),
      path: z.string().optional(),
    }),
    boxjsSettings: z.object({
      path: z.string().optional(),
    }),
  }),
});

export type ArgumentsBuilderConfig = z.infer<typeof argumentsBuilderConfigSchema>;

export function defineConfig(config: ArgumentsBuilderConfig) {
  return config;
}

program
  .command('build')
  .option('-c --config <config>', 'config file')
  .action(() => {
    const defaultConfigPath = [
      'arguments-builder.config.js',
      'arguments-builder.config.mjs',
      'arguments-builder.config.ts',
      'arguments-builder.config.json',
    ];
    // todo
  });
