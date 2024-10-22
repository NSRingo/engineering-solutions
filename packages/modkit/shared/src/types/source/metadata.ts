export interface ModuleMetadata {
  /**
   * 模块名称
   * @default 读取 package.json 中的 displayName
   */
  name: string;
  /**
   * 模块描述
   * @default 读取 package.json 中的 description
   */
  description: string;
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
  [key: string]: string | string[] | number | boolean | undefined;
}
