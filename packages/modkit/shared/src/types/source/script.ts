export interface ModuleScript {
  /**
   * 脚本名
   */
  name: string;
  /**
   * 脚本类型
   */
  type: 'http-request' | 'http-response' | 'cron' | 'event' | 'dns' | 'rule' | 'generic';
  /**
   * 脚本，对应 `source.script` 中的 key
   */
  scriptKey: string;
  /**
   * 脚本自动更新间隔
   */
  scriptUpdateInterval?: number;
  /**
   * 超时时间
   */
  timeout?: number;
  /**
   * 是否注入 argument
   */
  injectArgument?: boolean;
  /**
   * 自定义 argument，优先级高于 `injectArgument`
   */
  argument?: string;
  /**
   * 脚本执行引擎
   */
  engine?: 'auto' | 'jsc' | 'webview';
  /**
   * 匹配模式
   */
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
