import type { PartialBaseBuildConfig } from '@modern-js/module-tools';

export const buildConfig: PartialBaseBuildConfig = {
  buildType: 'bundleless',
  format: 'cjs',
  target: 'es2019',
  outDir: './dist',
  externalHelpers: true,
};
