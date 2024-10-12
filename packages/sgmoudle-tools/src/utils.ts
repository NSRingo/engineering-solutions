import handlebars from 'handlebars';
import type { SgModuleToolsOptions } from './types';

export const generateSgModule = (options: {
  name: string;
  module: SgModuleToolsOptions['module'];
}) => {
  const template = handlebars.compile(process.env.MODULE_TEMP);
  return template(options);
};
