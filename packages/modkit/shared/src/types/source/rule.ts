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

export type PolicyNameType =
  | 'DIRECT'
  | 'REJECT'
  | 'REJECT-NO-DROP'
  | 'REJECT-TINYGIF'
  | 'CELLULAR'
  | 'CELLULAR-ONLY'
  | 'HYBRID'
  | 'NO-HYBRID'
  | { custom: string };

export interface RuleSetRule {
  type: 'RULE-SET';
  /**
   * 对应 `source.assets` 中的 key
   */
  assetKey: string;
  /**
   * 策略名
   */
  policyName?: PolicyNameType;
  /**
   * 描述
   */
  description?: string;
}

export type ModuleRule = `${Exclude<RuleType, 'RULE-SET'>},${string}` | RuleSetRule;
