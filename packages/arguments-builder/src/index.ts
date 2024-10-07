import type { ArgumentsBuilderConfig } from './bin';

export * from './core';
export * from './core/types';

export type { ArgumentsBuilderConfig };

export function defineConfig(config: ArgumentsBuilderConfig) {
  return config;
}
