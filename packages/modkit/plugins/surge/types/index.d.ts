import '@iringo/modkit-shared';

declare module '@iringo/modkit-shared' {
  interface PluginModuleContent {
    general?: Record<string, string>;
    host?: Record<string, string>;
    rule?: string[];
    mitm?: {
      hostname?: string[];
      clientSourceAddress?: string[];
    };
    urlRewrite?: string[];
    headerRewrite?: string[];
    bodyRewrite?: string[];
    mapLocal?: string[];
  }

  interface PluginArgumentType {
    surge?: import('@iringo/modkit-shared').ArgumentType | 'exclude';
  }
}
