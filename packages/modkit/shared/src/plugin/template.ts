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
}
