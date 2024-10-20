export interface ModuleRewrite {
  pattern: string;
  type?: 'http-request' | 'http-response';
  mode?: 'header' | 302 | 'reject' | 'header-add' | 'header-del' | 'header-replace-regex';
  content: string | Record<string, string>;
}
