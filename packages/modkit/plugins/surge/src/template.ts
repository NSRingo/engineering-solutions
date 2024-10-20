import { Template } from '@iringo/modkit-shared';

export class SurgeTemplate extends Template {
  get metadata() {
    return this.source?.metadata || {};
  }

  get content() {
    return this.source?.content || {};
  }

  renderKeyValuePairs(ojb?: Record<string, string>) {
    return Object.entries(ojb || {})
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  }

  renderLines(lines?: string[]) {
    return (lines || []).join('\n');
  }

  renderMetadata(argumentsText: string, argumentsDescription: string) {
    const result: Record<string, string | undefined> = {};
    result.name = this.metadata.name;
    result.desc = this.metadata.description;
    result.requirement = this.metadata.system?.map((item) => `SYSTEM = ${item}`).join(' || ');
    result.version = this.metadata.version;
    if (argumentsText) {
      result.arguments = argumentsText;
    }
    if (argumentsDescription) {
      result['arguments-desc'] = argumentsDescription;
    }
    Object.entries(this.metadata.extra || {}).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? value.join(',') : value;
    });
    return Object.entries(result)
      .map(([key, value]) => (!!key && !!value ? `#!${key} = ${value}` : ''))
      .filter(Boolean)
      .join('\n');
  }

  renderRule() {
    return this.content.rule
      ?.map((rule) => {
        if (typeof rule === 'string') {
          return rule;
        }
        switch (rule.type) {
          case 'RULE-SET': {
            let result = `RULE-SET, ${this.utils.getFilePath(rule.assetKey)}`;
            if (rule.policyName) {
              result += `, ${rule.policyName}`;
            }
            return result;
          }
          default:
            break;
        }
      })
      .join('\n');
  }

  renderScript(scriptParams: string) {
    return (this.content.script || [])
      .map((script, index) => {
        const parameters = [];
        parameters.push(`type=${script.type}`);
        if (script.pattern) {
          parameters.push(`pattern=${script.pattern}`);
        }
        if (script.type === 'cron' && script.cronexp) {
          parameters.push(`cronexp="${script.cronexp}"`);
        }
        if (script.engine) {
          parameters.push(`requires-body=${JSON.stringify(!!script.requiresBody)}`);
        }
        if (script.binaryBodyMode) {
          parameters.push(`binary-body-mode=${JSON.stringify(!!script.binaryBodyMode)}`);
        }
        if (script.scriptKey) {
          parameters.push(`script-path=${this.utils.getScriptPath(script.scriptKey)}`);
        }
        if (script.engine) {
          parameters.push(`engine=${script.engine}`);
        }
        if (script.maxSize) {
          parameters.push(`max-size=${script.maxSize}`);
        }
        if (script.timeout) {
          parameters.push(`timeout=${script.timeout}`);
        }
        if (script.scriptUpdateInterval) {
          parameters.push(`script-update-interval=${script.scriptUpdateInterval}`);
        }
        if (script.debug || process.env.NODE_ENV === 'development') {
          parameters.push('debug=true');
        }
        if (script.injectArgument || script.argument) {
          parameters.push(`argument=${script.argument || scriptParams}`);
        }
        return `${script.name || `script${index}`} = ${parameters.join(', ')}`;
      })
      .join('\n');
  }

  handleArguments() {
    const args = this.source?.arguments || [];
    const argumentsText = args.map((arg) => `${arg.key}:${this.getDefaultValue(arg.defaultValue)}`).join(',');

    const argumentsDescription = args
      .map((arg) => {
        let result = arg.key;
        if (arg.name) {
          result += `: ${arg.name}`;
        }
        if (arg.options?.length) {
          result += '\n';
          result += arg.options
            .map((option, index, array) => {
              const prefix = index === array.length - 1 ? '└' : '├';
              return `    ${prefix} ${option.key}: ${option.label ?? option.key}`;
            })
            .join('\n');
        }
        if (arg.description) {
          result += `\n${arg.description}`;
        }
        result += '\n';
        return result;
      })
      .join('\n')
      .replace(/\n/g, '\\n');

    const scriptParams = args.map((item) => `${item.key}={{{${item.key}}}}`).join('&');

    return {
      argumentsText,
      argumentsDescription,
      scriptParams,
    };
  }

  private getDefaultValue(defaultValue: any): any {
    switch (typeof defaultValue) {
      case 'string':
        return `"${defaultValue}"`;
      case 'number':
      case 'boolean':
        return defaultValue;
      case 'object':
        if (Array.isArray(defaultValue) && defaultValue.length > 0) {
          return this.getDefaultValue(defaultValue[0]);
        }
        return '""';
      default:
        return '""';
    }
  }
}
