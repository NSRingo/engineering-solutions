import { Template, objectEntries, toKebabCase } from '@iringo/modkit-shared';

export class SurgeTemplate extends Template {
  get Metadata() {
    const { argumentsText, argumentsDescription } = this.#handleArguments();
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
    return this.renderKeyValuePairs(result, { prefix: '#!' });
  }

  get General() {
    return this.renderKeyValuePairs(this.content.surgeGeneral).trim();
  }

  get Host() {
    return this.renderKeyValuePairs(this.content.host).trim();
  }

  get Rule() {
    return this.content.rule
      ?.map((rule) => {
        if (typeof rule === 'string') {
          return rule;
        }
        switch (rule.type) {
          case 'RULE-SET': {
            let result = `RULE-SET, ${this.utils.getFilePath(rule.assetKey)}`;
            if (rule.policyName) {
              result += `, ${this.normalizeUnion(rule.policyName, 'custom')}`;
            }
            if (rule.description) {
              result += ` # ${rule.description}`;
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

  get Script() {
    const { scriptParams } = this.#handleArguments();
    return (this.content.script || [])
      .map((script, index) => {
        const parameters: Record<string, any> = {};
        const { name, scriptKey, debug, ...rest } = script;
        parameters['script-path'] = this.utils.getScriptPath(scriptKey);
        objectEntries(rest).forEach(([key, value]) => {
          parameters[toKebabCase(key)] = value;
        });
        if (debug || process.env.NODE_ENV === 'development') {
          parameters.debug = true;
        }
        if (script.injectArgument || script.argument) {
          parameters.argument = script.argument || scriptParams;
        }
        return `${name || `script${index}`} = ${this.renderKeyValuePairs(parameters, { join: ', ', separator: '=' })}`;
      })
      .join('\n')
      .trim();
  }

  get MITM() {
    if (!this.content.mitm) {
      return '';
    }
    let result = '';
    if (this.content.mitm.hostname?.length) {
      result += `hostname = %APPEND%  ${this.content.mitm.hostname.join(', ')}\n`;
    }
    if (this.content.mitm.clientSourceAddress?.length) {
      result += `client-source-address = %APPEND%  ${this.content.mitm.clientSourceAddress.join(', ')}\n`;
    }
    return result.trim();
  }

  get #rewrite() {
    const urlRewrites: string[] = [];
    const headerRewrites: string[] = [];
    const bodyRewrites: string[] = [];
    this.content.rewrite?.forEach((rewrite) => {
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
        default: {
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
    return (this.content.mock || [])
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
}
