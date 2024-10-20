export type MockData = string | { content: string };

export interface ModuleMock {
  pattern: string;
  dataType: 'file' | 'text' | 'tiny-gif' | 'base64';
  /**
   * 对应 `source.assets` 中的 key，或者 content 传入原生字符串
   */
  data?: MockData;
  statusCode?: number;
  headers?: Record<string, string>;
}
