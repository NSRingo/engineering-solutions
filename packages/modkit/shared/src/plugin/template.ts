import type { TemplateParametersParams } from './manager';

export class Template {
  constructor(readonly params: TemplateParametersParams) {}

  get source() {
    return this.params.source;
  }

  get utils() {
    const { getFilePath, getScriptPath } = this.params;
    return {
      getFilePath,
      getScriptPath,
    };
  }
}
