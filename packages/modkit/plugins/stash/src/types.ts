export interface StashOverride {
  name?: string;
  desc?: string;

  http?: {
    'force-http-engine'?: string[];
    'url-rewrite'?: string[];
    mitm?: string[];

    script?: {
      match?: string;
      name?: string;
      type?: 'request' | 'response';
      'require-body'?: boolean;
      timeout?: number;
      argument?: string;
      debug?: boolean;
      'binary-mode'?: boolean;
      'max-size'?: number;
    }[];
  };

  'script-providers'?: {
    [key: string]: {
      url: string;
      interval?: number;
    };
  };

  [key: string]: any;
}
