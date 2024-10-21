import { type RuleType, Template, logger, objectEntries, toKebabCase } from '@iringo/modkit-shared';

const ruleTypeMap: Record<RuleType, string> = {
  DOMAIN: 'host',
  'DOMAIN-SUFFIX': 'host-suffix',
  'DOMAIN-KEYWORD': 'host-keyword',
  GEOIP: 'geoip',
  'USER-AGENT': 'user-agent',
  'IP-CIDR': 'ip-cidr',
  'IP-CIDR6': 'ip6-cidr',
  'IP-ASN': 'ip-asn',
  'PROCESS-NAME': 'process',
};

export class QuantumultxTemplate extends Template {
  get Metadata() {
    const result: Record<string, string | undefined> = {};
    result.name = this.metadata.name;
    result.desc = this.metadata.description;
    result.system = this.metadata.system?.join();
    result.version = this.metadata.version;
    Object.entries(this.metadata.extra || {}).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? value.join(',') : value;
    });
    return this.renderKeyValuePairs(result, { prefix: '#!' });
  }

  get DNS() {
    const dnss: string[] = [];
    // 没写呢
    return dnss.join('\n').trim();
  }

  get Filter() {
    const filters: string[] = [];
    this.content.rule?.forEach((rule) => {
      if (typeof rule === 'string') {
        return rule;
      }
      const { type, content, policyName } = rule;
      const options = [];
      if (ruleTypeMap[type]) {
        options.push(ruleTypeMap[type]);
      } else {
        logger.warn(`[Quantumult X] Unsupported rule type: ${type}`);
      }
      options.push(content);
      options.push(policyName);
      filters.push(options.join(', '));
    });
    return filters.join('\n').trim();
  }

  get Rewrite() {
    const rewrites: string[] = [];
    this.content.rewrite?.forEach((rewrite) => {
      let { type, pattern, mode, content, ...rest } = rewrite;
      switch (rewrite.mode) {
        case 'header':
          logger.warn('[Quantumult X] Unsupported rewrite mode: header');
          break;
        case 'header-add':
          mode = 'request-header';
          break;
        case 'header-del':
          mode = 'request-header';
          content += " ''";
          break;
        case undefined:
          switch (type) {
            case 'http-request':
              mode = 'request-body';
              break;
            case 'http-response':
              mode = 'response-body';
              break;
          }
          break;
      }
      const options = [];
      options.push(pattern);
      options.push('url');
      options.push(mode);
      options.push(content || '');
      rewrites.push(options.join(' '));
    });
    return `${rewrites.join('\n').trim()}\n${this.#script.rewrite}`;
  }

  get #script() {
    const rewrites: string[] = [];
    const tasks: string[] = [];
    this.content.script?.forEach((script, index) => {
      let { type, pattern, cronexp, scriptKey, argument, injectArgument, name, ...rest } = script;
      switch (type) {
        case 'http-request':
          type = 'script-request';
          break;
        case 'http-response':
          type = 'script-response';
          break;
        case 'generic':
          // 没找到示例
          break;
        case 'event':
          // 没找到示例
          break;
        case 'dns':
          logger.warn('[Quantumult X] Unsupported script type: dns');
          break;
      }
      const parameters: Record<string, any> = {};
      parameters['script-path'] = this.utils.getScriptPath(scriptKey);
      parameters.tag = name || `Script${index}`;
      const options = [];
      switch (type) {
        case 'script-request':
        case 'script-response':
          options.push(pattern);
          options.push('url');
          options.push(type);
          options.push(parameters['script-path']);
          rewrites.push(`# ${parameters.tag}\n${options.join(' ')}`);
          break;
        case 'cron': {
          options.push(cronexp);
          options.push(parameters['script-path']);
          const option = [options.join(' ')];
          if (name) {
            option.push(`tag = ${name}`);
          }
          if (imgUrl) {
            option.push(`img-url = ${imgUrl}`);
          }
          if (enabled) {
            option.push(`enabled = ${enabled}`);
          }
          tasks.push(option.join(', '));
          break;
        }
      }
    });
    const rewrite = rewrites.join('\n').trim();
    const task = tasks.join('\n').trim();
    return { rewrite, task };
  }

  get MITM() {
    return this.content.mitm?.hostname?.join(', ');
  }
}
