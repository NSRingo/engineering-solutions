import { format } from 'date-fns';
import handlebars from 'handlebars';

handlebars.registerHelper('now', (formatStr: string) => {
  const now = new Date();
  if (formatStr) {
    return format(now, formatStr);
  }
  return now.toISOString();
});

export { handlebars };
