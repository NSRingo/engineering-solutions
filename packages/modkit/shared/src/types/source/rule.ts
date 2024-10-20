export interface RuleSetRule {
  type: 'RULE-SET';
  /**
   * 对应 `source.assets` 中的 key
   */
  assetKey: string;
  /**
   * 策略名
   */
  policyName?: string;
}

export type ModuleRule = string | RuleSetRule;
