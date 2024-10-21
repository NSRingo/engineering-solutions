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
