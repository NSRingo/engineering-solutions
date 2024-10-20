import type { ArgumentItem } from './argument';
import type { ModuleMetadata } from './metadata';
import type { ModuleMITM } from './mitm';
import type { ModuleMock } from './mock';
import type { ModuleRewrite } from './rewrite';
import type { ModuleRule } from './rule';
import type { ModuleScript } from './script';

export interface PluginModuleContent {
  [key: string]: any;
}

export interface ModuleContent extends PluginModuleContent {
  script?: ModuleScript[];
  rule?: ModuleRule[];
  rewrite?: ModuleRewrite[];
  mock?: ModuleMock[];
  mitm?: ModuleMITM;
}

export interface SourceConfig {
  /**
   * 模块名称
   */
  moduleName?: string;
  /**
   * 模块元数据
   */
  metadata?: ModuleMetadata;
  /**
   * 模块参数
   */
  arguments?: ArgumentItem[];
  /**
   * 模块内容
   */
  content?: ModuleContent;
  /**
   * 待编译的脚本
   */
  scripts?: Record<string, string>;
  /**
   * 复制到产物的静态资源，key 为文件名，value 为文件路径
   */
  assets?: Record<string, string>;
}

export type * from './argument';
export type * from './metadata';
export type * from './mitm';
export type * from './mock';
export type * from './rewrite';
export type * from './rule';
export type * from './script';
