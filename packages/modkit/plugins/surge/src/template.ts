import type { ModkitConfig, ModuleContent } from '@iringo/modkit-shared';

export class SurgeTemplate {
  constructor(private readonly source: ModkitConfig<Record<string, string>>['source']) {}

  get metadata() {
    return this.source?.metadata || {};
  }

  get content() {
    return this.source?.content || {};
  }

  private SECTION_TITLE_MAP: Record<keyof ModuleContent<string>, string> = {
    general: 'General',
    host: 'Host',
    proxy: 'Proxy',
    rule: 'Rule',
    script: 'Script',
    urlRewrite: 'URL Rewrite',
    headerRewrite: 'Header Rewrite',
    bodyRewrite: 'Body Rewrite',
    mapLocal: 'Map Local',
    mitm: 'MITM',
  };

  renderTemplate() {
    const { argumentsText, argumentsDescription, scriptParams } = this.handleArguments();
    let result = '';
    result += this.renderMetadata(argumentsText, argumentsDescription);
    result += '\n\n';
    result += this.renderContentWithoutScript();
    result += '\n\n';
    result += this.renderScript(scriptParams);
    return result;
  }

  private renderMetadata(argumentsText: string, argumentsDescription: string) {
    const result: Record<string, string | undefined> = {};
    result.name = this.metadata.name;
    result.desc = this.metadata.description;
    result.requirement = this.metadata.system?.map((item) => `SYSTEM = ${item}`).join(' || ');
    result.version = this.metadata.version;
    if (this.metadata.arguments) {
      result.arguments = argumentsText;
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

  private renderContentWithoutScript() {
    let result = '';
    ['general', 'host'].forEach((key) => {
      if (this.content[key]) {
        result += `[${this.SECTION_TITLE_MAP[key]}]\n`;
        Object.entries(this.content[key]).forEach(([k, v]) => {
          result += `${k} = ${v}\n`;
        });
        result += '\n';
      }
    });
    (['rule', 'urlRewrite', 'headerRewrite', 'bodyRewrite', 'mapLocal'] as const).forEach((key) => {
      if (this.content[key]) {
        result += `[${this.SECTION_TITLE_MAP[key]}]\n`;
        this.content[key].forEach((item) => {
          result += `${item}\n`;
        });
        result += '\n';
      }
    });

    if (this.content.mitm) {
      result += `[${this.SECTION_TITLE_MAP.mitm}]\n`;
      if (this.content.mitm.hostname) {
        result += `hostname = %APPEND% ${this.content.mitm.hostname.join(',')}\n`;
      }
      if (this.content.mitm.clientSourceAddress) {
        result += `client-source-address = ${this.content.mitm.clientSourceAddress.join(',')}\n`;
      }
    }
    return result;
  }

  private renderScript(scriptParams?: string) {
    let result = '';
    if (!this.content.script) {
      return;
    }
    result += `[${this.SECTION_TITLE_MAP.script}]\n`;
    this.content.script.forEach((script) => {
      result += `${script.name} = type=${script.type}`;
      if (script.pattern) {
        result += `, pattern=${script.pattern}`;
      }
      if (script.type === 'cron' && script.cronexp) {
        result += `, cronexp=${script.cronexp}`;
      }
      result += `, requires-body=${JSON.stringify(!!script.requiresBody)}`;
      result += `, binary-body-mode=${JSON.stringify(!!script.binaryBodyMode)}`;
      result += `, script-path=<%= getScriptPath(compilation, '${script.scriptKey}', assetPrefix) %>`;
      if (script.engine) {
        result += `, engine=${script.engine}`;
      }
      if (script.maxSize) {
        result += `, max-size=${script.maxSize}`;
      }
      if (script.timeout) {
        result += `, timeout=${script.timeout}`;
      }
      if (script.scriptUpdateInterval) {
        result += `, script-update-interval=${script.scriptUpdateInterval}`;
      }
      if (script.debug || process.env.NODE_ENV === 'development') {
        result += ', debug=true';
      }
      if (script.injectArgument || script.argument) {
        result += `, argument=${script.argument || scriptParams}`;
      }
      result += '\n';
    });
    return result;
  }

  private handleArguments() {
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
