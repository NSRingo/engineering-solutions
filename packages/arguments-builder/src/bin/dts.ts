import fs from 'node:fs';
import path from 'node:path';
import type { ArgumentsBuilder } from '../core';
import type { Output } from './config';

export const buildDtsArguments = (builder: ArgumentsBuilder, output: Output['dts']) => {
  const outputPath = output?.path ?? path.resolve('./src/settings.d.ts');
  fs.writeFileSync(
    outputPath,
    builder.buildDtsArguments({
      isExported: output?.isExported ?? !outputPath.endsWith('.d.ts'),
    }),
  );
};
