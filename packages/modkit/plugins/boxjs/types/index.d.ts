import '@iringo/modkit-shared';
import type { BoxJsType } from '../dist';

declare module '@iringo/modkit-shared' {
  interface PluginModuleContent {}

  interface PluginArgumentType {
    boxJs?: BoxJsType | 'exclude';
  }
}
