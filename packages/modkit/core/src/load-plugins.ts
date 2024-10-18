import { type ModkitConfig, createPlugin } from '@iringo/modkit-shared';

export const loadPlugins = (config: ModkitConfig<Record<string, string>>) => {
  return config.plugins?.map((item) => createPlugin(item.setup, item)) ?? [];
};
export type Plugins = ReturnType<typeof loadPlugins>;
