import type { ModkitConfig, ModuleContent } from '@iringo/modkit-shared';
import type { Metadata, Mock, Rewrite, Script } from '@iringo/modkit-shared';
import type { Compilation } from '@rspack/core';

// 希望作为 class Module 的扩展类，但我不会设计
export default class SurgeModule extends Module {
  Metadata(metadata: Metadata, args: { argumentsText: string; argumentsDescription: string }) {
    const result: Record<string, string | undefined> = {};
    result.name = metadata.name;
    result.desc = metadata.description;
    if (metadata.system) result.requirement = metadata.system?.map((item) => `SYSTEM = ${item}`).join(' || ');
    if (metadata.version) result.version = metadata.version;
    if (metadata.arguments) {
      result.arguments = args.argumentsText;
      result['arguments-desc'] = args.argumentsDescription;
    }
    Object.entries(metadata.extra || {}).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? value.join(',') : value;
    });
    return Object.entries(result)
      .map(([key, value]) => (!!key && !!value ? `#!${key} = ${value}` : ''))
      .filter(Boolean)
      .join('\n');
  }

  General = (generals: Record<string, string>) =>
    Object.entries(generals)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');

  Rule = (rules: string[]) => rules.join('\n');

  Rewrite = (rewrites: Rewrite[]) => {
    const urlRewrites = [];
    const headerRewrites = [];
    const bodyRewrites = [];
    rewrites.forEach((rewrite) => {
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
        case undefined: {
          const options = [];
          options.push(rewrite.type);
          options.push(rewrite.pattern);
          options.push(rewrite.content);
          bodyRewrites.push(options.join(' '));
          break;
        }
      }
    });
    const urlRewrite = urlRewrites.join('\n');
    const headerRewrite = headerRewrites.join('\n');
    const bodyRewrite = bodyRewrites.join('\n');
    return { urlRewrite, headerRewrite, bodyRewrite };
  };

  Mock = (mocks: Mock<string>[]) =>
    mocks
      .map((mock) => {
        const options = [];
        options.push(mock.pattern);
        if (mock.dataType) options.push(`data-type=${mock.dataType}`);
        if (mock.data) options.push(`data=${mock.data}`);
        if (mock.statusCode) options.push(`status-code=${mock.statusCode}`);
        if (mock.header) {
          switch (typeof mock.header) {
            case 'string':
              options.push(`header=${mock.header}`);
              break;
            case 'object': {
              const header = Object.entries(mock.header)
                .map((value) => value.join(':'))
                .join('|');
              options.push(`header=${header}`);
              break;
            }
          }
        }
        return options.join(' ');
      })
      .join('\n');

  Host = (hosts: Record<string, string>) =>
    Object.entries(hosts)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');

  Script = (
    scripts: Script<string>[],
    getScriptPath: (compilation: Compilation, scriptKey: string, assetPrefix?: string) => string,
    scriptParams?: string,
  ) =>
    scripts
      .map((script: Script<string>, index) => {
        const options = [];
        options.push(`type=${script.type}`);
        if (script.pattern) options.push(`pattern=${script.pattern}`);
        if (script.type === 'cron' && script.cronexp) options.push(`cronexp="${script.cronexp}"`);
        if (script.engine) options.push(`requires-body=${JSON.stringify(!!script.requiresBody)}`);
        if (script.binaryBodyMode) options.push(`binary-body-mode=${JSON.stringify(!!script.binaryBodyMode)}`);
        if (script.scriptKey) options.push(`script-path=${getScriptPath(undefined, script.scriptKey)}`);
        if (script.engine) options.push(`engine=${script.engine}`);
        if (script.maxSize) options.push(`max-size=${script.maxSize}`);
        if (script.timeout) options.push(`timeout=${script.timeout}`);
        if (script.scriptUpdateInterval) options.push(`script-update-interval=${script.scriptUpdateInterval}`);
        if (script.debug || process.env.NODE_ENV === 'development') options.push('debug=true');
        if (script.injectArgument || script.argument) options.push(`argument=${script.argument || scriptParams}`);
        return `${script.name || `script${index}`} = ${options.join(',')}`;
      })
      .join('\n');

  MitM = (mitms: string[]) => `%APPEND% ${mitms.join(',')}`;
}
