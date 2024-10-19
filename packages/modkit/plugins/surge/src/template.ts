import { Template } from '@iringo/modkit-shared';

export class SurgeTemplate extends Template {
  get metadata() {
    return this.source?.metadata || {};
  }

  get content() {
    return this.source?.content || {};
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

  renderGeneral() {
    return Object.entries(this.content.general || {})
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  }

  renderHost() {
    return Object.entries(this.content.host || {})
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  }

  renderRule() {
    return this.content.rule?.join('\n') || '';
  }

  renderScript(scriptParams: string) {
    return (this.content.script || [])
      .map((script, index) => {
        const options = [];
        options.push(`type=${script.type}`);
        if (script.pattern) {
          options.push(`pattern=${script.pattern}`);
        }
        if (script.type === 'cron' && script.cronexp) {
          options.push(`cronexp="${script.cronexp}"`);
        }
        if (script.engine) {
          options.push(`requires-body=${JSON.stringify(!!script.requiresBody)}`);
        }
        if (script.binaryBodyMode) {
          options.push(`binary-body-mode=${JSON.stringify(!!script.binaryBodyMode)}`);
        }
        if (script.scriptKey) {
          options.push(`script-path=${this.getScriptPath(script.scriptKey)}`);
        }
        if (script.engine) {
          options.push(`engine=${script.engine}`);
        }
        if (script.maxSize) {
          options.push(`max-size=${script.maxSize}`);
        }
        if (script.timeout) {
          options.push(`timeout=${script.timeout}`);
        }
        if (script.scriptUpdateInterval) {
          options.push(`script-update-interval=${script.scriptUpdateInterval}`);
        }
        if (script.debug || process.env.NODE_ENV === 'development') {
          options.push('debug=true');
        }
        if (script.injectArgument || script.argument) {
          options.push(`argument=${script.argument || scriptParams}`);
        }
        return `${script.name || `script${index}`} = ${options.join(', ')}`;
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
