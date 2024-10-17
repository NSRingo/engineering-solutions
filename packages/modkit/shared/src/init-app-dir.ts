import path from 'node:path';
import { packageUp } from 'package-up';

export const initAppDir = async (currentDir?: string): Promise<string> => {
  const cwd: string = currentDir || process.cwd();
  const pkg = await packageUp({ cwd });

  if (!pkg) {
    throw new Error(`no package.json found in current work dir: ${cwd}`);
  }

  return path.dirname(pkg);
};
