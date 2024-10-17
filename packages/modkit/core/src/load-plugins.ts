import { type ModkitConfig, createPlugin } from '@iringo/modkit-shared';

export const loadPlugins = (config: ModkitConfig<any>) => {
  return config.plugins?.map((item) => createPlugin(item.setup, item)) ?? [];
};
