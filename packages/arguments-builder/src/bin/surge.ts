import fs from 'node:fs';
import path from 'node:path';
import { logger } from 'rslog';
import type { ArgumentsBuilder } from '../core';
import type { Output } from './config';
import { handlebars } from './handlebars';

export const buildSurgeArguments = (builder: ArgumentsBuilder, output: Output['surge'], configFileDir: string) => {
  const templatePath = path.resolve(configFileDir, output?.template ?? 'template/surge.handlebars');
  if (!fs.existsSync(templatePath)) {
    logger.warn('Surge template file does not exist, please check the configuration file');
    return;
  }
  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  const outputPath = output?.path ?? path.resolve('surge.sgmodule');

  const { argumentsText, argumentsDescription, scriptParams } = builder.buildSurgeArguments();

  fs.writeFileSync(
    outputPath,
    template({
      arguments: argumentsText,
      argumentsDesc: argumentsDescription.replace(/\n/g, '\\n'),
      scriptParams,
    }),
  );
};
