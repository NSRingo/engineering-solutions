import '@iringo/modkit-shared';
import type { LoonArgumentType } from '../dist/index';

declare module '@iringo/modkit-shared' {
  interface PluginModuleContent {
    loonGeneral?: Record<string, string>;
  }

  interface PluginArgumentType {
    loon?: LoonArgumentType;
  }
}
