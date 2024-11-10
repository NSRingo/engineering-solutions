import '@iringo/modkit-shared';

declare module '@iringo/modkit-shared' {
  interface ModkitPluginName {
    surge: 'surge';
  }

  interface PluginModuleContent {
    surgeGeneral?: Record<string, string>;
  }

  interface PluginModuleMITM {
    clientSourceAddress?: string[];
  }

  interface PluginArgumentType {
    surge?: import('@iringo/modkit-shared').ArgumentType | 'exclude';
  }
}
