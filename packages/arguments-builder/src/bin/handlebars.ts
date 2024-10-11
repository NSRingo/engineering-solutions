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

export { handlebars };
