// @ts-nocheck
/**
 * @deprecated 迁移至 ../types
 */
import type { RsbuildConfig } from '@rsbuild/core';
import type { PluginAPI } from '../plugin/manager';
import type { PluginModuleContent } from '../types';

// 三合一写法（建议用这个，因为只有surge区分Url Header Body）
// 有type没mode: BodyRewrite
// 有mode没type: UrlRewrite
// 有type有mode: HeaderRewrite
// mode是'header' | 302 | 'reject': UrlRewrite
// mode是'header-add' | 'header-del' | 'header-replace-regex': HeaderRewrite
// 没mode: BodyRewrite
export interface Rewrite {
  type?: 'http-request' | 'http-response';
  pattern: string;
  mode?: 'header' | 302 | 'reject' | 'header-add' | 'header-del' | 'header-replace-regex';
  content: string | Record<string, string>;
}

// 按Surge三种Rewrite分开的写法
export interface UrlRewrite {
  pattern: string;
  content: string;
  mode: 'header' | 302 | 'reject';
}
export interface HeaderRewrite {
  type: 'http-request' | 'http-response';
  pattern: string;
  mode: 'header-add' | 'header-del' | 'header-replace-regex';
  content: string | Record<string, string>;
}
export interface BodyRewrite {
  type: 'http-request' | 'http-response';
  pattern: string;
  content: Record<string, string>;
}

// 建议叫Mock而不是MapLocal，因为Mock是功能名
export interface Mock<FileKey extends string> {
  pattern: string;
  dataType: 'file' | 'text' | 'tiny-gif' | 'base64';
  data?: string | FileKey;
  statusCode?: number;
  headers?: Record<string, string>;
}

export interface ModuleContent extends PluginModuleContent {
  script?: Script[];
  rule?: Rule[];
}

export interface ModkitConfig {
  source?: {
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
  };
  dev?: {
    /**
     * @default 3000
     */
    port?: number;
  };
  output?: {
    distPath?: {
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
    };
    /**
     * 静态资源的 URL 前缀
     */
    assetPrefix?: string;
  };
  tools?: {
    bundlerChain?: NonNullable<RsbuildConfig['tools']>['bundlerChain'];
    /**
     * 选项用于修改 Rspack 的配置项
     * @link https://rsbuild.dev/zh/config/tools/rspack
     */
    rspack?: NonNullable<RsbuildConfig['tools']>['rspack'];
    /**
     * 设置 [builtin:swc-loader](https://rspack.dev/guide/features/builtin-swc-loader) 的选项
     */
    swc?: NonNullable<RsbuildConfig['tools']>['swc'];
  };

  plugins?: ModkitPlugin[];
}

export interface ModkitPlugin {
  /**
   * 插件名称
   */
  name: string;

  setup: (api: PluginAPI) => PluginHooks;
}
