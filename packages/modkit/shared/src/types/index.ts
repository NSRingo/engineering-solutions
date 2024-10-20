import type { RsbuildConfig } from '@rsbuild/core';
import type { ModkitPlugin } from './plugin';
import type { SourceConfig } from './source';

export interface DevConfig {
  /**
   * @default 3000
   */
  port?: number;
}

export interface OutputDistPath {
  /**
   * 输出目录
   * @default dist
   */
  root?: string;
  /**
   * js 文件的输出目录
   * @default 'scripts'
   */
  js?: string;
  /**
   * 文件的输出目录
   * @default 'static'
   */
  assets?: string;
}

export interface Output {
  distPath?: OutputDistPath;
  /**
   * 静态资源的 URL 前缀
   */
  assetPrefix?: string;
}

export interface ModkitConfig {
  source?: SourceConfig;
  dev?: DevConfig;
  output?: Output;
  tools?: Pick<NonNullable<RsbuildConfig['tools']>, 'bundlerChain' | 'rspack' | 'swc'>;
  plugins?: ModkitPlugin[];
}

export * from './plugin';
export * from './source';
