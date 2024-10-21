import { Template, yaml } from '@iringo/modkit-shared';

export class StashTemplate extends Template {
  get output() {
    return yaml.dump(this.#overrideContent);
  }

  get #overrideContent() {
    const result: Record<string, string | undefined> = {
      name: this.metadata.name,
      desc: this.metadata.description,
      version: this.metadata.version,
    };

    return result;
  }
}
