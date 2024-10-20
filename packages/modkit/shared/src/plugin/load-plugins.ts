import type { ModkitConfig } from '../types';
import { createPlugin } from './manager';

export const loadPlugins = (config: ModkitConfig) => {
  return config.plugins?.map((item) => createPlugin(item.setup, item)) ?? [];
};
