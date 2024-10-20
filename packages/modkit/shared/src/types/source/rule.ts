export type RuleType =
  | 'DOMAIN'
  | 'DOMAIN-SUFFIX'
  | 'DOMAIN-KEYWORD'
  | 'DOMAIN-SET'
  | 'IP-CIDR'
  | 'IP-CIDR6'
  | 'GEOIP'
  | 'IP-ASN'
  | 'USER-AGENT'
  | 'URL-REGEX'
  | 'PROCESS-NAME'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'SUBNET'
  | 'DEST-PORT'
  | 'IN-PORT'
  | 'SRC-PORT'
  | 'SRC-IP'
  | 'PROTOCOL'
  | 'SCRIPT'
  | 'CELLULAR-RADIO'
  | 'DEVICE-NAME'
  | 'RULE-SET'
  | 'FINAL';

export type policyNameType =
  | 'DIRECT'
  | 'REJECT'
  | 'REJECT-NO-DROP'
  | 'REJECT-TINYGIF'
  | 'CELLULAR'
  | 'CELLULAR-ONLY'
  | 'HYBRID'
  | 'NO-HYBRID'
  | string;

export interface Rule {
  type: RuleType;
  content?: string;
  /**
   * 对应 `source.assets` 中的 key
   */
  assetKey?: string;
  /**
   * 策略名
   */
  policyName?: policyNameType;
  /**
   * 描述
   */
  description?: string;
}

export type ModuleRule = string | Rule;
