type StashRuleType =
  | 'DOMAIN'
  | 'DOMAIN-SUFFIX'
  | 'DOMAIN-KEYWORD'
  | 'GEOIP'
  | 'IP-ASN'
  | 'IP-CIDR'
  | 'IP-CIDR6'
  | 'DST-PORT'
  | 'RULE-SET'
  | 'GEOSITE'
  | 'PROCESS-NAME'
  | 'PROCESS-PATH'
  | 'SCRIPT';

export interface StashOverride {
  name?: string;
  desc?: string;

  rule?: `${StashRuleType},${string}`[];

  'rule-providers'?: {
    [key: string]: {
      behavior: 'domain' | 'ipcidr' | 'classical';
      format: 'yaml' | 'text';
      url: string;
      interval?: number;
    };
  };

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
