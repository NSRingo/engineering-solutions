import type { ModkitConfig } from '@iringo/modkit-shared';
import { createPlugin } from './manager';

export const loadPlugins = (config: ModkitConfig<any>) => {
  return config.plugins?.map((item) => createPlugin(item.setup as any, item as any)) ?? [];
};
