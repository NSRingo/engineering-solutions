import type { ArgumentsBuilderConfig } from './bin';

export * from './core';
export * from './core/types';

export function defineConfig(config: ArgumentsBuilderConfig) {
  return config;
}
