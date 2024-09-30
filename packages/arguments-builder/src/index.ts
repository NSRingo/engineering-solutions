export enum ArgumentType {
  String = 'string',
  // Number = 'number',
  Boolean = 'boolean',
  Array = 'array',
}

export interface ArgumentItem {
  /**
   * 参数 key
   */
  key: string;
  /**
   * 参数类型
   */
  type: ArgumentType;
  /**
   * 参数描述
   */
  description?: string;
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 选项
   */
  options?: {
    key: string;
    label?: string;
  }[];
  /**
   * 额外信息
   */
  extra?: string;
}

export interface ArgumentsBuilderOptions {
  args?: ArgumentItem[];
  boxjsConfig?: {
    /**
     * boxjs scope
     */
    scope: string;
  };
}

export class ArgumentsBuilder {
  constructor(private readonly options: ArgumentsBuilderOptions) {}

  public buildBoxJsSettings() {
    const scope = this.options.boxjsConfig?.scope ?? '';
    return this.options.args?.map((arg) => {
      let type = 'text';
      if (arg.type === ArgumentType.Boolean) {
        type = 'boolean';
      }
      if (arg.options) {
        if (arg.type === ArgumentType.Array) {
          type = 'checkboxes';
        } else {
          type = 'selects';
        }
      }
      return {
        id: `${scope}.${arg.key}`,
        name: arg.description,
        type,
        val: arg.defaultValue,
        items: arg.options,
        desc: arg.extra,
      };
    });
  }

  public buildSurgeArguments() {
    const argumentsText = this.options.args
      ?.map((arg) => {
        let result = arg.key;
        if (arg.defaultValue) {
          result += `:${arg.defaultValue}`;
        }
      })
      .join(',');

    const argumentsDescription = this.options.args?.map((arg) => {
      let result = arg.key;
      if (arg.description) {
        result += `: ${arg.description}`;
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
      if (arg.extra) {
        result += `\n${arg.extra}`;
      }
      result += '\n';
      return result;
    });

    return {
      argumentsText,
      argumentsDescription,
    };
  }
}
