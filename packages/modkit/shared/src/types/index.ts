import type { RsbuildConfig } from '@rsbuild/core';
import type { Output } from './output';
import type { ModkitPlugin } from './plugin';
import type { SourceConfig } from './source';

export interface DevConfig {
  /**
   * @default 3000
   */
  port?: number;
}

export interface ModkitConfig {
  source?: SourceConfig;
  dev?: DevConfig;
  output?: Output;
  tools?: Pick<NonNullable<RsbuildConfig['tools']>, 'bundlerChain' | 'rspack' | 'swc'>;
  plugins?: ModkitPlugin[];
}

export * from './source';
export * from './output';
export * from './plugin';
