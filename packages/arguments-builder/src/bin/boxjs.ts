import fs from 'node:fs';
import path from 'node:path';
import type { ArgumentsBuilder } from '../core';
import type { Output } from './config';

export const buildBoxJsSettings = (builder: ArgumentsBuilder, output: Output['boxjsSettings']) => {
  const outputPath = output?.path ?? path.resolve('./boxjs.settings.json');
  fs.writeFileSync(outputPath, JSON.stringify(builder.buildBoxJsSettings(output?.scope)));
};
