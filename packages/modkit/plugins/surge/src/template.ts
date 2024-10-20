import { Template } from '@iringo/modkit-shared';

export class SurgeTemplate extends Template {
  get #metadata() {
    return this.source?.metadata || {};
  }

  get #content() {
    return this.source?.content || {};
  }

  get General() {
    return this.renderKeyValuePairs(this.#content.general).trim();
  }

  get Host() {
    return this.renderKeyValuePairs(this.#content.host).trim();
  }

  get Rule() {
    return this.#content.rule
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
      .join('\n')
      .trim();
  }

  get Metadata() {
    const { argumentsText, argumentsDescription } = this.#handleArguments();
    const result: Record<string, string | undefined> = {};
    result.name = this.#metadata.name;
    result.desc = this.#metadata.description;
    result.requirement = this.#metadata.system?.map((item) => `SYSTEM = ${item}`).join(' || ');
    result.version = this.#metadata.version;
    if (argumentsText) {
      result.arguments = argumentsText;
    }
    if (argumentsDescription) {
      result['arguments-desc'] = argumentsDescription;
    }
    Object.entries(this.#metadata.extra || {}).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? value.join(',') : value;
    });
    return Object.entries(result)
      .map(([key, value]) => (!!key && !!value ? `#!${key} = ${value}` : ''))
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  get Script() {
    const { scriptParams } = this.#handleArguments();
    return (this.#content.script || [])
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
      .join('\n')
      .trim();
  }

  get MITM() {
    if (!this.#content.mitm) {
      return '';
    }
    let result = '';
    if (this.#content.mitm.hostname?.length) {
      result += `hostname = %APPEND%  ${this.#content.mitm.hostname.join(', ')}\n`;
    }
    if (this.#content.mitm.clientSourceAddress?.length) {
      result += `client-source-address = %APPEND%  ${this.#content.mitm.clientSourceAddress.join(', ')}\n`;
    }
    return result.trim();
  }

  get #rewrite() {
    const urlRewrites: string[] = [];
    const headerRewrites: string[] = [];
    const bodyRewrites: string[] = [];
    this.#content.rewrite?.forEach((rewrite) => {
      switch (rewrite.mode) {
        case 'header':
        case 302:
        case 'reject': {
          const options = [];
          options.push(rewrite.pattern);
          options.push(rewrite.content);
          options.push(rewrite.mode);
          urlRewrites.push(options.join(' '));
          break;
        }
        case 'header-add':
        case 'header-del':
        case 'header-replace-regex': {
          const options = [];
          options.push(rewrite.type);
          options.push(rewrite.pattern);
          options.push(rewrite.mode);
          options.push(rewrite.content);
          headerRewrites.push(options.join(' '));
          break;
        }
        case undefined: {
          const options = [];
          options.push(rewrite.type);
          options.push(rewrite.pattern);
          options.push(rewrite.content);
          bodyRewrites.push(options.join(' '));
          break;
        }
      }
    });
    return {
      url: urlRewrites.join('\n').trim(),
      header: headerRewrites.join('\n').trim(),
      body: bodyRewrites.join('\n').trim(),
    };
  }

  get URLRewrite() {
    return this.#rewrite.url;
  }

  get HeaderRewrite() {
    return this.#rewrite.header;
  }

  get BodyRewrite() {
    return this.#rewrite.body;
  }

  get MapLocal() {
    return (this.#content.mock || [])
      .map((mock) => {
        const options = [];
        options.push(mock.pattern);
        if (mock.dataType) {
          options.push(`data-type=${mock.dataType}`);
        }
        if (typeof mock.data === 'string') {
          options.push(`data=${this.utils.getFilePath(mock.data) || mock.data}`);
        } else if (!!mock.data && 'content' in mock.data) {
          options.push(`data=${mock.data.content}`);
        }
        if (mock.statusCode) {
          options.push(`status-code=${mock.statusCode}`);
        }
        if (mock.headers) {
          switch (typeof mock.headers) {
            case 'string':
              options.push(`header=${mock.headers}`);
              break;
            case 'object': {
              const header = Object.entries(mock.headers)
                .map((value) => value.join(':'))
                .join('|');
              options.push(`header=${header}`);
              break;
            }
          }
        }
        return options.join(' ');
      })
      .join('\n')
      .trim();
  }

  #handleArguments() {
    const args = this.source?.arguments || [];
    const argumentsText = args.map((arg) => `${arg.key}:${this.#getDefaultValue(arg.defaultValue)}`).join(',');

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

  #getDefaultValue(defaultValue: any): any {
    switch (typeof defaultValue) {
      case 'string':
        return `"${defaultValue}"`;
      case 'number':
      case 'boolean':
        return defaultValue;
      case 'object':
        if (Array.isArray(defaultValue) && defaultValue.length > 0) {
          return this.#getDefaultValue(defaultValue[0]);
        }
        return '""';
      default:
        return '""';
    }
  }
}
