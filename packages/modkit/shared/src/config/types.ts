/**
 * @link https://github.com/chavyleung/scripts/blob/master/box/chavy.boxjs.html#L1019
 */
export type BoxJsType =
  | 'number'
  | 'boolean'
  | 'text'
  | 'slider'
  | 'textarea'
  | 'radios'
  | 'checkboxes'
  | 'colorpicker'
  | 'selects'
  | 'modalSelects';

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
  type: ArgumentType;
  /**
   * 自动的映射关系无法满足时，可以使用 boxJsType 来自定义
   */
  boxJsType?: BoxJsType;
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
  defaultValue?: any;
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
  /**
   * 当前参数在哪些平台上不生效
   */
  exclude?: ('surge' | 'loon' | 'boxjs' | 'dts')[];
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
  system?: Array<'iOS' | 'iPadOS' | 'tvOS' | 'macOS' | 'watchOS'>;
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

  extra?: {
    /**
     * 额外的配置，当类型为 `string[]` 时，在 `stash` 输出为数组，其他平台则转为字符串换行
     */
    [key: string]: string | string[];
  };
}

export interface SurgeScript {
  name: string;
  type: 'http-request' | 'http-response' | 'cron' | 'event' | 'dns' | 'rule' | 'generic';
  scriptPath: string;
  scriptUpdateInterval?: number;
  timeout?: number;
  argument?: string;
  engine?: 'auto' | 'jsc' | 'webview';
  pattern?: string;
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
  cron?: string;
  /**
   * 是否开启 debug 模式
   * @default dev 环境下为 true，其他环境下为 false
   */
  debug?: boolean;
}

export interface ModuleContent {
  general?: Record<string, string>;
  host?: Record<string, string>;
  rule?: string[];
  script?: SurgeScript[];
  mitm?: {
    hostname?: string[];
    clientSourceAddress?: string[];
  };
  urlRewrite?: string[];
  headerRewrite?: string[];
  bodyRewrite?: string[];
  mapLocal?: string[];
}

export interface ModkitConfig {
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
    content?: ModuleContent;
  };
  output?: {
    distPath?: {
      /**
       * 输出目录
       * @default dist
       */
      root?: string;
      /**
       * Surge 输出路径
       * @default {package.json#name}.sgmodule
       */
      surge?: string;

      /**
       * Loon 输出路径
       * @default {package.json#name}.plugin
       */
      loon?: string;

      /**
       * Quantumult x 输出路径
       * @default {package.json#name}.snippet
       */
      qx?: string;

      /**
       * Stash 输出路径
       * @default {package.json#name}.stoverride
       */
      stash?: string;
    };
    dts?: {
      /**
       * d.ts 文件路径
       * @default ./src/settings.d.ts
       */
      path?: string;
      /**
       * 是否导出
       * @default false
       */
      isExported?: boolean;
    };
    boxjsSettings?: {
      scope?: string;
      distPath?: string;
    };
  };
}
