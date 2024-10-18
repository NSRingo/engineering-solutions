export default class SurgeModule extends Module {
  General = (generals) =>
    Object.entries(generals)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  Rule = (rules) =>
    Object.entries(rules)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  URLRewrite = (urlRewrites) =>
    Object.entries(urlRewrites)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  HeaderRewrite = (headerRewrites) =>
    Object.entries(headerRewrites)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  BodyRewrite = (bodyRewrites) =>
    Object.entries(bodyRewrites)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  Mock = (Mocks) =>
    Mocks.map((mock) => {
      let line = `${mock.pattern} `;
      line += Object.entries(script)
        .map(([key, value]) => {
          switch (key) {
            case 'pattern':
              break;
            case 'statusCode':
              return `status-code=${value}`;
            case 'dataType':
              return `data-type=${value}`;
            case 'mockDataIsBase64':
              return `mock-data-is-base64=${value}`;
            default:
              switch (typeof value) {
                case 'boolean':
                case 'number':
                  return `${key}=${value}`;
                default:
                  return `${key}="${value}"`;
              }
          }
        })
        .join(' ');
      return line;
    }).join('\n');
  Host = (hosts) =>
    Object.entries(hosts)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  Script = (scripts) =>
    scripts
      .map((script) => {
        let line = `${script.name} = type=${script.type},`;
        switch (script.type) {
          case 'http-request':
          case 'http-response':
            line += `pattern=${script.pattern},`;
            break;
          case 'cron':
            line += `cronexp="${script.cronexp}",`;
            break;
          case 'generic':
          case 'event':
          case 'dns':
            break;
        }
        line += `script-path=${getScriptPath(compilation, script.scriptKey, assetPrefix)},`;
        line += Object.entries(script)
          .map(([key, value]) => {
            switch (key) {
              case 'name':
              case 'type':
              case 'pattern':
              case 'cronexp':
              case 'scriptKey':
                break;
              default:
                return `${key}=${value}`;
            }
          })
          .join(',');
        return line;
      })
      .join('\n');
  MitM = (mitms) => `%APPEND% ${mitms.join(',')}`;
}
