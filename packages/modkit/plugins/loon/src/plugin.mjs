export default class LoonPlugin extends Module {
  General = (generals) =>
    Object.entries(generals)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  Rule = (rules) =>
    Object.entries(rules)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  Rewrite = (rewrites) =>
    Object.entries(rewrites)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  Mock = (Mocks) =>
    Mocks.map((mock) => {
      let line = `${mock.pattern.replaceAll(' ', '\x20')} mock-response-body `;
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
                  return `${key}="${value.replaceAll(' ', '\x20')}"`;
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
        let line = '';
        switch (script.type) {
          case 'http-request':
          case 'http-response':
            line += `${script.type} ${script.pattern},`;
            break;
          case 'cron':
            line += `${script.type} "${script.cronexp}",`;
            break;
          case 'generic':
            line += `${script.type} `;
            break;
          case 'network-changed':
          case 'event':
            line += 'network-changed ';
            break;
          case 'dns':
            console.error('Unsupported script type: dns');
            break;
        }
        line += `script-path=${getScriptPath(compilation, script.scriptKey, assetPrefix)},`;
        line += Object.entries(script)
          .map(([key, value]) => {
            switch (key) {
              case 'name':
                return `tag = ${value}`;
              case 'type':
              case 'pattern':
              case 'cronexp':
              case 'scriptKey':
                break;
              default:
                return `${key} = ${value}`;
            }
          })
          .join(',');
        return line;
      })
      .join('\n');
  MitM = (mitms) => mitms.join(',');
}
