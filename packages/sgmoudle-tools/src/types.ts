export interface SurgeScript {
  name: string;
  type: 'http-request' | 'http-response' | 'cron' | 'event' | 'dns' | 'rule' | 'generic';
  scriptPath: string;
  //   timeout?: number;
  argument?: string;
  engine?: 'auto' | 'jsc' | 'webview';
  pattern?: string;
  requiresBody?: boolean;
  binaryBodyMode?: boolean;
}

export interface SgModuleToolsOptions {
  port?: number;
  module?: {
    general?: Record<string, string>;
    host?: Record<string, string>;
    rule?: string[];
    script?: SurgeScript[];
    mitm?: {
      hostname?: string[];
    };
    urlRewrite?: string[];
    headerRewrite?: string[];
    bodyRewrite?: string[];
    mapLocal?: string[];
  };
}
