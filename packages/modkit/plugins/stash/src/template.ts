import { Template } from '@iringo/modkit-shared';
import YAML from 'yaml';
import type { StashOverride } from './types';

export class StashTemplate extends Template {
  get output() {
    return YAML.stringify(this.#override);
  }

  get #override(): StashOverride {
    const result: StashOverride = {};

    result.name = this.metadata.name;
    result.desc = this.metadata.description;
    result.version = this.metadata.version;
    Object.entries(this.metadata.extra || {}).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? value.join('\n') : value;
    });

    result.http ??= {};

    if (this.content.mitm?.hostname?.length) {
      result.http.mitm = this.content.mitm.hostname;
    }

    if (this.content.script?.length) {
      this.content.script.forEach((script) => {
        result.http ??= {};
        result.http.script ??= [];
        if (['http-request', 'http-response'].includes(script.type)) {
          result.http.script.push({
            match: script.pattern,
            name: script.scriptKey,
            type: script.type === 'http-request' ? 'request' : 'response',
            'require-body': script.requiresBody,
            timeout: script.timeout,
            debug: script.debug,
            'binary-mode': script.binaryBodyMode,
            'max-size': script.maxSize,
          });
          result['script-providers'] ??= {};
          result['script-providers'][script.scriptKey] = {
            url: this.utils.getScriptPath(script.scriptKey),
            interval: script.scriptUpdateInterval,
          };
        }
      });
    }

    return result;
  }
}
