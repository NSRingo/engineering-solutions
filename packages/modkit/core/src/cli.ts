import { commander, loadConfig, logger } from '@iringo/modkit-shared';
import { useBuildScript } from './build';

export function initCommand() {
  const { program } = commander;

  process.env.MODKIT_ROOT ??= process.cwd();

  program.version(process.env.MODKIT_VERSION || '0.0.0');

  const buildCommand = program.command('build');
  const devCommand = program.command('dev');

  [buildCommand, devCommand].forEach((command) => {
    command.option('-c --config <config>', 'specify the configuration file, can be a relative or absolute path');
  });

  buildCommand.action(async (option) => {
    const { config } = await loadConfig(option.config);

    process.env.NODE_ENV = 'production';

    const { compiler } = useBuildScript(config);

    compiler.run((err, stats) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      }
      if (!stats) {
        logger.error('No stats returned');
        process.exit(1);
      }

      if (stats.hasErrors()) {
        logger.error('Build failed\n', stats.toString({ colors: true }));
        process.exit(1);
      }

      if (stats.hasWarnings()) {
        logger.warn('Build completed with warnings\n', stats.toString({ colors: true }));
        process.exit(0);
      }

      logger.success('Build completed\n', stats.toString({ colors: true }));
    });
  });

  devCommand.action(async (option) => {
    const { config } = await loadConfig(option.config);

    const { compiler } = useBuildScript(config);

    compiler.watch(
      {
        aggregateTimeout: 300,
        poll: undefined,
      },
      (err, stats) => {
        if (err) {
          logger.error(err);
          process.exit(1);
        }
        if (!stats) {
          logger.error('No stats returned');
          process.exit(1);
        }

        if (stats.hasErrors()) {
          logger.error('Build failed\n', stats.toString({ colors: true }));
          process.exit(1);
        }

        if (stats.hasWarnings()) {
          logger.warn('Build completed with warnings\n', stats.toString({ colors: true }));
          process.exit(0);
        }

        logger.success('Build completed\n', stats.toString({ colors: true }));
      },
    );
  });

  program.parse(process.argv);
}
