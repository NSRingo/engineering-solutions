import { program } from 'commander';
import { buildBoxJsSettings } from './boxjs';
import { getBuilder } from './builder';
import { ArgumentsBuilderConfig } from './config';
import { buildDtsArguments } from './dts';
import { buildLoonArguments } from './loon';
import { buildSurgeArguments } from './surge';

export { ArgumentsBuilderConfig };

program.version(process.env.VERSION || '0.0.0');

const dtsCommand = program.command('dts').description('Generate d.ts file');
const surgeCommand = program.command('surge').description('Generate Surge configuration file');
const loonCommand = program.command('loon').description('Generate Loon configuration file');
const boxjsCommand = program.command('boxjs').description('Generate BoxJS settings snippet');
const buildCommand = program.command('build').description('Generate all configuration files');

[buildCommand, surgeCommand, loonCommand, boxjsCommand, dtsCommand].forEach((command) => {
  command.option('-c --config <config>', 'specify the configuration file, can be a relative or absolute path');
});

dtsCommand.action(async (option) => {
  const { builder, output } = (await getBuilder({ path: option.config })) ?? {};
  if (!builder) {
    return;
  }
  buildDtsArguments(builder, output?.dts);
});

surgeCommand.action(async (option) => {
  const { builder, output, configFileDir } = (await getBuilder({ path: option.config })) ?? {};
  if (!builder) {
    return;
  }
  buildSurgeArguments(builder, output?.surge, configFileDir ?? process.cwd());
});

loonCommand.action(async (option) => {
  const { builder, output, configFileDir } = (await getBuilder({ path: option.config })) ?? {};
  if (!builder) {
    return;
  }
  buildLoonArguments(builder, output?.loon, configFileDir ?? process.cwd());
});

boxjsCommand.action(async (option) => {
  const { builder, output } = (await getBuilder({ path: option.config })) ?? {};
  if (!builder) {
    return;
  }
  buildBoxJsSettings(builder, output?.boxjsSettings);
});

buildCommand.action(async (option) => {
  const { builder, output, configFileDir } = (await getBuilder({ path: option.config })) ?? {};
  if (!builder) {
    return;
  }
  await Promise.allSettled([
    buildSurgeArguments(builder, output?.surge, configFileDir ?? process.cwd()),
    buildLoonArguments(builder, output?.loon, configFileDir ?? process.cwd()),
    buildBoxJsSettings(builder, output?.boxjsSettings),
  ]);
});

program.parse(process.argv);
