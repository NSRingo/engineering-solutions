import { commander } from '@iringo/modkit-shared';

const { program } = commander;

export function initCommand() {
  program.version(process.env.MODKIT_VERSION || '0.0.0');
  program.parse(process.argv);
}
