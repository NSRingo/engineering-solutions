import { commander, loadConfig } from '@iringo/modkit-shared';
import minimist from 'minimist';
import { loadPlugins } from './load-plugins';
import { manager } from './manager';

export async function initCommand() {
  let hooksRunner: Awaited<ReturnType<typeof manager.init>> | undefined;

  manager.clear();

  const cliParams = minimist<{
    c?: string;
    config?: string;
  }>(process.argv.slice(2));

  const { program } = commander;

  process.env.MODKIT_ROOT ??= process.cwd();

  program.version(process.env.MODKIT_VERSION || '0.0.0');

  const { config } = await loadConfig(cliParams.config || cliParams.c);

  const plugins = loadPlugins(config);

  plugins.forEach((plugin) => plugin && manager.usePlugin(plugin));

  hooksRunner = await manager.init();

  const buildCommand = program.command('build');
  const devCommand = program.command('dev');

  [buildCommand, devCommand].forEach((command) => {
    command.option('-c --config <config>', 'specify the configuration file, can be a relative or absolute path');
  });

  buildCommand.action(async () => {
    process.env.NODE_ENV = 'production';

    console.log(hooksRunner.modifyConfig());
  });

  program.parse(process.argv);
}
