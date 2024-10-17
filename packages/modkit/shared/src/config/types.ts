import type { commander } from '@iringo/utils';
import type { RsbuildConfig } from '@rsbuild/core';

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

export interface ArgumentItem {
  /**
   * 参数 key
   */
  key: string;
  /**
   * 参数类型
   */
  type:
    | ArgumentType
    | {
        default: ArgumentType;
        /**
         * 如果插件支持更多的参数类型，可自定义传入
         */
        [custom: string]: any;
      };
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
   * 支持的系统
   */
  system?: 'iOS' | 'iPadOS' | 'tvOS' | 'macOS' | 'watchOS'[];
  /**
   * 最低支持的系统版本
   */
  systemVersion?: number;
  /**
   * 是否生成 arguments 及 arguments-desc
   * @default true
   */
  arguments?: boolean;
  /**
   * 版本号
   * @default 默认读取 package.json 中的 version
   */
  version?: string;
  /**
   * 额外的配置
   */
  extra?: {
    [key: string]: string | string[];
  };
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

export interface ModuleContent<ScriptKey extends string> {
  general?: Record<string, string>;
  host?: Record<string, string>;
  rule?: string[];
  script?: Script<ScriptKey>[];
  mitm?: {
    hostname?: string[];
    clientSourceAddress?: string[];
  };
  urlRewrite?: string[];
  headerRewrite?: string[];
  bodyRewrite?: string[];
  mapLocal?: string[];
}

export interface ModkitConfig<ScriptInput extends Record<string, string>> {
  source?: {
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

  setup: () => {
    /**
     * 针对当前平台修改配置
     */
    modifyConfig?: (config: ModkitConfig<ScriptInput>) => ModkitConfig<ScriptInput>;
    /**
     * 处理参数
     */
    processArguments?: (args: ArgumentItem[]) => Record<string, any>;
    /**
     * 模块渲染
     */
    moduleRender?: (args: {
      /**
       * 当前平台的配置
       */
      config: ModkitConfig<ScriptInput>;
      /**
       * 经过处理的参数上下文
       */
      argumentsContext: Record<string, any>;
      /**
       * 是否为生产环境
       */
      isProd: boolean;
    }) => void;
    /**
     * 为 commander 添加新的 CLI 命令
     */
    commands?: (utils: { program: commander.Command }) => void;
  };
}
