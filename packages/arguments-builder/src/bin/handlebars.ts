import { format } from 'date-fns';
import handlebars from 'handlebars';

handlebars.registerHelper('now', (formatStr: string) => {
  const now = new Date();
  if (formatStr) {
    return format(now, formatStr);
  }
  return now.toISOString();
});

handlebars.registerHelper('version', () => {
  return process.env.BUILD_VERSION || '0.0.0';
});

handlebars.registerHelper('@package', (key: string) => {
  const keyList = key.split('.');
  const packageJson = JSON.parse(process.env.PACKAGE_JSON_DATA || '{}');
  return keyList.reduce((prev: any, cur) => prev[cur], packageJson);
});

handlebars.registerHelper('inline', (string?: string) => {
  return new handlebars.SafeString(string?.replace(/\n/g, '\\n') ?? '');
});

handlebars.registerHelper('split', (string?: string, separator = '\n') => {
  if (!string) {
    return [];
  }
  let actualSeparator = separator;
  if (actualSeparator === '\\n') {
    actualSeparator = '\n';
  }
  return string.split(actualSeparator);
});

export { handlebars };
