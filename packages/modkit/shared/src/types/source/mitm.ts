export interface PluginModuleMITM {
  [key: string]: any;
}

export interface ModuleMITM extends PluginModuleMITM {
  hostname?: string[];
}
