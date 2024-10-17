import { AppContext, commander, initAppContext, initAppDir, loadConfig, manager } from '@iringo/modkit-shared';
import minimist from 'minimist';
import { useRsbuild } from './build';
import { loadPlugins } from './load-plugins';

export async function initCommand() {
  manager.clear();

  const cliParams = minimist<{
    c?: string;
    config?: string;
  }>(process.argv.slice(2));

  const { program } = commander;

  process.env.MODKIT_ROOT ??= process.cwd();

  const appDirectory = await initAppDir(process.env.MODKIT_ROOT);

  program.version(process.env.MODKIT_VERSION || '0.0.0');

  const { config } = await loadConfig(cliParams.config || cliParams.c);

  const plugins = loadPlugins(config);

  plugins.forEach((plugin) => plugin && manager.usePlugin(plugin));

  const appContext = initAppContext({
    appDirectory,
  });
  AppContext.set(appContext);

  const hooksRunner = await manager.init();

  const { rsbuild } = await useRsbuild(config, plugins);

  const buildCommand = program.command('build');
  const devCommand = program.command('dev');

  [buildCommand, devCommand].forEach((command) => {
    command.option('-c --config <config>', 'specify the configuration file, can be a relative or absolute path');
  });

  buildCommand.action(async () => {
    process.env.NODE_ENV = 'production';

    rsbuild.build();
  });

  program.parse(process.argv);
}
