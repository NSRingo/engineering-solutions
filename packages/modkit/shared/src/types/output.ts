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

export type HandleArgumentsDefaultValue = (
  defaultValue: any,
  utils: {
    /**
     * 内置的处理参数默认值的方法
     */
    handleArgumentsDefaultValue: (defaultValue: any) => string;
  },
) => string;

export interface Output {
  distPath?: OutputDistPath;
  /**
   * 静态资源的 URL 前缀
   */
  assetPrefix?: string;
  /**
   * 自定义处理参数的默认值
   */
  handleArgumentsDefaultValue?: HandleArgumentsDefaultValue;
}
