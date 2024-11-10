import type { RsbuildConfig } from '@rsbuild/core';
import type { Output } from './output';
import type { ModkitPlugin } from './plugin';
import type { SourceConfig } from './source';

export interface DevConfig extends Pick<NonNullable<RsbuildConfig['dev']>, 'progressBar' | 'writeToDisk'> {
  /**
   * @default 3000
   */
  port?: number;
}

export interface ModkitConfigTools
  extends Pick<NonNullable<RsbuildConfig['tools']>, 'bundlerChain' | 'rspack' | 'swc'> {
  rsbuild?: {
    plugins?: RsbuildConfig['plugins'];
  };
}

export interface ModkitConfig {
  source?: SourceConfig;
  dev?: DevConfig;
  output?: Output;
  tools?: ModkitConfigTools;
  plugins?: ModkitPlugin[];
}

export * from './source';
export * from './output';
export * from './plugin';
