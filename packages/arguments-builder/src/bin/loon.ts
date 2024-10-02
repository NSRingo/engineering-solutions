import fs from 'node:fs';
import path from 'node:path';
import { logger } from 'rslog';
import type { ArgumentsBuilder } from '../core';
import type { Output } from './config';
import { handlebars } from './handlebars';

export const buildLoonArguments = (builder: ArgumentsBuilder, output: Output['loon'], configFileDir: string) => {
  const templatePath = path.resolve(configFileDir, output?.template ?? 'template/loon.handlebars');
  if (!fs.existsSync(templatePath)) {
    logger.warn('Loon template file does not exist, please check the configuration file');
    return;
  }

  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  const outputPath = output?.path ?? path.resolve('loon.plugin');

  const { argumentsText, scriptParams } = builder.buildLoonArguments();

  fs.writeFileSync(
    outputPath,
    template({
      arguments: argumentsText,
      scriptParams,
    }),
  );
};
