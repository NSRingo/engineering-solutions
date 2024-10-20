import type { TemplateParametersParams } from '../types/plugin';

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

  renderKeyValuePairs(ojb?: Record<string, string>) {
    return Object.entries(ojb || {})
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  }

  renderLines(lines?: string[]) {
    return (lines || []).join('\n');
  }

  objectEntries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj);
  }
}
