import '@iringo/modkit-shared';
import type { BoxJsType } from '../dist';

declare module '@iringo/modkit-shared' {
  interface ModkitPluginName {
    boxjs: 'boxjs';
  }

  interface PluginArgumentType {
    boxJs?: BoxJsType | 'exclude';
  }
}
