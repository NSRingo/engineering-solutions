import '@iringo/modkit-shared';

declare module '@iringo/modkit-shared' {
  interface PluginArgumentType {
    stash?: 'exclude';
  }
}
