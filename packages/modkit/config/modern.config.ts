import type { PartialBaseBuildConfig } from '@modern-js/module-tools';

export const define = {
  'process.env.MODKIT_VERSION': require('../core/package.json').version,
};

export const esmBuildConfig: PartialBaseBuildConfig = {
  format: 'esm',
  target: 'es2021',
  define,
  autoExtension: true,
  shims: true,
  banner: {
    js: [`import { createRequire } from 'module';`, `var require = createRequire(import.meta['url']);`, ''].join('\n'),
  },
  dts: false,
};

export const cjsBuildConfig: PartialBaseBuildConfig = {
  format: 'cjs',
  target: 'es2021',
  define,
  autoExtension: true,
  dts: false,
};

export const dualBuildConfigs: PartialBaseBuildConfig[] = [
  cjsBuildConfig,
  esmBuildConfig,
  {
    buildType: 'bundleless',
    dts: {
      only: true,
    },
  },
];
