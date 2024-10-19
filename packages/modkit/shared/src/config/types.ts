import type { RsbuildConfig } from '@rsbuild/core';
import type { PluginAPI, PluginHooks } from '../plugin/manager';
import type { PluginModuleContent } from '../types';

// /**
//  * @link https://github.com/chavyleung/scripts/blob/master/box/chavy.boxjs.html#L1019
//  */
// export type BoxJsType =
//   | 'number'
//   | 'boolean'
//   | 'text'
//   | 'slider'
//   | 'textarea'
//   | 'radios'
//   | 'checkboxes'
//   | 'colorpicker'
//   | 'selects'
//   | 'modalSelects';

/**
 * @link https://nsloon.app/docs/Plugin/#argumentbuild-733
 */
export type LoonType = 'input' | 'select' | 'switch';

export type ArgumentType = 'string' | 'number' | 'boolean' | 'array';

export interface PluginArgumentType {
  default: ArgumentType;
  /**
   * 如果插件支持更多的参数类型，可自定义传入
   */
  [custom: string]: any;
}

export interface ArgumentItem {
  /**
   * 参数 key
   */
  key: string;
  /**
   * 参数类型
   */
  type: ArgumentType | PluginArgumentType;
  /**
   * 参数描述
   */
  name?: string;
  /**
   * 参数简介
   */
  description?: string;
  /**
   * 默认值
   */
  defaultValue?: string | number | boolean | (string | number | boolean)[];
  /**
   * 选项
   */
  options?: {
    key: string;
    label?: string;
  }[];
  /**
   * 输入框占位符
   */
  placeholder?: string;
}

export interface ModuleMetadata {
  /**
   * 模块名称
   * @default 读取 package.json 中的 displayName
   */
  name?: string;
  /**
   * 模块描述
   * @default 读取 package.json 中的 description
   */
  description?: string;
  /**
   * 版本号
   * @default 默认读取 package.json 中的 version
   */
  version?: string;
  /**
   * 支持的系统
   */
  system?: ('iOS' | 'iPadOS' | 'tvOS' | 'macOS' | 'watchOS')[];
  /**
   * 额外的配置
   */
  extra?: {
    [key: string]: string | string[];
  };
}

// 建议交给QX内置解析器自己处理，因为只有QX插件的写法和其他的不一样
export interface Rule<RuleSetKey extends string> {
  name?: string;
  type:
    | 'DOMAIN'
    | 'DOMAIN-SUFFIX'
    | 'DOMAIN-KEYWORD'
    | 'DOMAIN-SET'
    | 'IP-CIDR'
    | 'IP-CIDR6'
    | 'GEOIP'
    | 'IP-ASN'
    | 'USER-AGENT'
    | 'URL-REGEX'
    | 'PROCESS-NAME'
    | 'AND'
    | 'OR'
    | 'NOT'
    | 'SUBNET'
    | 'DEST-PORT'
    | 'IN-PORT'
    | 'SRC-PORT'
    | 'SRC-IP'
    | 'PROTOCOL'
    | 'SCRIPT'
    | 'CELLULAR-RADIO'
    | 'DEVICE-NAME'
    | 'RULE-SET'
    | 'FINAL';
  /**
   * 规则组，对应 `source.ruleSet` 中的 key
   */
  content: string | number | RuleSetKey;
  policy:
    | 'DIRECT'
    | 'REJECT'
    | 'REJECT-NO-DROP'
    | 'REJECT-TINYGIF'
    | 'CELLULAR'
    | 'CELLULAR-ONLY'
    | 'HYBRID'
    | 'NO-HYBRID'
    | string;

  parameters?: 'extended-matching' | 'no-resolve' | 'dns-failed';
}

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

export interface Script<ScriptKey extends string> {
  name: string;
  type: 'http-request' | 'http-response' | 'cron' | 'event' | 'dns' | 'rule' | 'generic';
  /**
   * 脚本，对应 `source.script` 中的 key
   */
  scriptKey: ScriptKey;
  scriptUpdateInterval?: number;
  timeout?: number;
  /**
   * 是否注入 argument
   */
  injectArgument?: boolean;
  /**
   * 自定义 argument，优先级高于 `injectArgument`
   */
  argument?: string;
  engine?: 'auto' | 'jsc' | 'webview';
  pattern?: string;
  /**
   * 最大允许的 body 大小，超过此大小则会跳过脚本执行
   * @default 131072
   */
  maxSize?: number;
  /**
   * 是否获取 http 请求的 body
   */
  requiresBody?: boolean;
  /**
   * 获取 http 请求的 body 类型为 Uint8Array
   */
  binaryBodyMode?: boolean;
  /**
   * cron 表达式，仅在 type 为 cron 时有效
   */
  cronexp?: string;
  /**
   * 是否开启 debug 模式
   * @default dev 环境下为 true，其他环境下为 false
   */
  debug?: boolean;
}

export interface ModuleContent<ScriptKey extends string> extends PluginModuleContent {
  script?: Script<ScriptKey>[];
}

export interface ModkitConfig<ScriptInput extends Record<string, string>> {
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
    content?: ModuleContent<keyof ScriptInput & string>;
    /**
     * 待编译的脚本
     */
    scripts?: ScriptInput;
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

  plugins?: ModkitPlugin<ScriptInput>[];
}

export interface ModkitPlugin<ScriptInput extends Record<string, string> = any> {
  /**
   * 插件名称
   */
  name: string;

  setup: (api: PluginAPI) => PluginHooks<ScriptInput>;
}
