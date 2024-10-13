import type { ModkitConfig } from './types';

export function defineConfig(config: ModkitConfig | (() => ModkitConfig)): ModkitConfig {
  if (typeof config === 'function') {
    return config();
  }
  return config;
}

const getDefaultConfig = (): ModkitConfig => {
  const root = process.env.MODKIT_ROOT || process.cwd();

  let packageJson: any = {};
  try {
    packageJson = require(`${root}/package.json`);
  } catch (e) {
    // ignore
  }

  return {
    source: {
      metadata: {
        name: packageJson.displayName || packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
      },
    },
    output: {
      distPath: {
        root: 'dist',
        surge: `${packageJson.name}.sgmodule`,
        loon: `${packageJson.name}.plugin`,
        qx: `${packageJson.name}.snippet`,
        stash: `${packageJson.name}.stoverride`,
      },
      dts: {
        path: './src/settings.d.ts',
        isExported: false,
      },
    },
  };
};
