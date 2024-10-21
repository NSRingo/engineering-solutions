import type { TemplateParametersParams } from '../types/plugin';
import { handleArgumentsDefaultValue } from '../utils';

export class Template {
  constructor(readonly params: TemplateParametersParams) {}

  get source() {
    return this.params.source;
  }

  get metadata() {
    return this.source?.metadata || {};
  }

  get content() {
    return this.source?.content || {};
  }

  get utils() {
    const { getFilePath, getScriptPath } = this.params;
    return {
      getFilePath,
      getScriptPath,
    };
  }

  renderKeyValuePairs(ojb?: Record<string, string | undefined>, { separator = ' = ', join = '\n', prefix = '' } = {}) {
    return Object.entries(ojb || {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${prefix}${key}${separator}${value}`)
      .join(join)
      .trim();
  }

  renderLines(lines?: string[]) {
    return (lines || []).join('\n').trim();
  }

  getDefaultValue(value: any) {
    return this.params.handleArgumentsDefaultValue(value, { handleArgumentsDefaultValue });
  }

  normalizeUnion<T extends string | object, K extends T extends string ? never : keyof T>(value: T, key?: K) {
    if (typeof value !== 'object') {
      return value;
    }
    if (key && value?.[key]) {
      return value[key];
    }
    return undefined;
  }
}
