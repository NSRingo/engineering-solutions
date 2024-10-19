import type { ModkitConfig } from '../config';

export class Template {
  constructor(
    readonly source: ModkitConfig<Record<string, string>>['source'],
    readonly getScriptPath: (scriptKey: string) => string,
  ) {}
}
