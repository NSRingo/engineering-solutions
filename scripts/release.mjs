import { execSync } from 'node:child_process';

const pkgs = JSON.parse(execSync('pnpm recursive list --depth 0 --json').toString());

for (const pkg of pkgs) {
  if (pkg.private) continue;

  /**
   * @type {string[]}
   */
  let versions = [];
  try {
    versions = JSON.parse(execSync(`pnpm info ${pkg.name} versions --json`).toString());
  } catch (error) {
    versions = [];
  }

  if (versions.includes(pkg.version)) continue;

  execSync(`NPM_TOKEN=${process.env.NPM_TOKEN} npm publish`, {
    cwd: pkg.path,
    stdio: 'inherit',
  });
}
