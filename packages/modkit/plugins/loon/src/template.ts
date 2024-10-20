import { Template, logger } from '@iringo/modkit-shared';
import type { LoonArgumentType } from './index';

export class LoonTemplate extends Template {
  get General() {
    return this.renderKeyValuePairs(this.content.loonGeneral).trim();
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

  get Argument() {
    return this.source.arguments
      ?.map((arg) => {
        let result = arg.key;
        let type: LoonArgumentType = 'input';
        if (arg.type === 'boolean') {
          type = 'switch';
        } else if (arg.options && arg.type !== 'array') {
          // 只有在有选项且不是数组类型时才使用 select
          type = 'select';
        }
        result += ` = ${type}`;
        result += `,${this.#getDefaultValue(arg.defaultValue)}`;
        if (arg.options && type === 'select') {
          result += ',';
          result += arg.options
            .filter((item) => item.key !== arg.defaultValue)
            .map((option) => `${this.#getDefaultValue(option.key)}`)
            .join(',');
        }
        if (arg.name) {
          result += `,tag=${arg.name}`;
        }
        if (arg.description) {
          result += `,desc=${arg.description}`;
        }
        return result;
      })
      .join('\n')
      .trim();
  }

  get Script() {
    return this.content.script?.map((script, index) => {
      let line = '';
      switch (script.type) {
        case 'http-request':
        case 'http-response':
          line += `${script.type} ${script.pattern},`;
          break;
        case 'cron':
          line += `${script.type} "${script.cronexp}",`;
          break;
        case 'generic':
          line += `${script.type} `;
          break;
        // case 'network-changed':
        case 'event':
          line += 'network-changed ';
          break;
        case 'dns':
          logger.warn('[Loon] Unsupported script type: dns');
          break;
      }
      line += `script-path=${this.utils.getScriptPath(script.scriptKey)},`;
      line += this.objectEntries(script)
        .map(([key, value]) => {
          switch (key) {
            case 'name':
              return `tag = ${value || `Script${index}`}`;
            case 'argument':
              return `argument = ${value}`;
            case 'injectArgument': {
              if (!script.argument && value) {
                return `argument = [${this.source.arguments?.map((item) => `{${item.key}}`).join(',')}]`;
              }
              return '';
            }
            case 'type':
            case 'pattern':
            case 'cronexp':
            case 'scriptKey':
              return '';

            default:
              return `${key} = ${value}`;
          }
        })
        .filter(Boolean)
        .join(',')
        .trim();
      return line;
    });
  }

  get MITM() {
    return this.content.mitm?.hostname?.join(', ');
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
