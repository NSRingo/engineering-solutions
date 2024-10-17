import type { commander } from '@iringo/utils';
import { type AsyncWorker, createAsyncManager, createAsyncWorkflow } from '@modern-js/plugin';
import type { ArgumentItem, ModkitConfig } from '../config';
import { runMaybeAsync } from '../utils';
import { setAppContext, useAppContext } from './context';

interface ModuleRenderParams<T extends Record<string, string>> {
  /**
   * 当前平台的配置
   */
  config: ModkitConfig<T>;
  /**
   * 经过处理的参数上下文
   */
  argumentsContext: Record<string, any>;
  /**
   * 是否为生产环境
   */
  isProd: boolean;
}

export interface PluginHooks<T extends Record<string, string>> {
  /**
   * 针对当前平台修改配置
   */
  modifySource?: AsyncWorker<{ source: ModkitConfig<T>['source'] }, ModkitConfig<T>['source']>;

  /**
   * 处理参数
   */
  processArguments?: AsyncWorker<{ args: ArgumentItem[] }, Record<string, any>>;
  /**
   * 模块渲染
   */
  moduleRender?: AsyncWorker<ModuleRenderParams<T>, string>;
  /**
   * 为 commander 添加新的 CLI 命令
   */
  commands?: AsyncWorker<{ program: commander.Command }, void>;
}

const hooks = {
  modifySource: createAsyncWorkflow<{ source: ModkitConfig<any>['source'] }, ModkitConfig<any>['source']>(),
  processArguments: createAsyncWorkflow<{ args: ArgumentItem[] }, Record<string, any>>(),
  moduleRender: createAsyncWorkflow<ModuleRenderParams<any>, string>(),
  commands: createAsyncWorkflow<{ program: commander.Command }, void>(),
};

export const pluginAPI = {
  setAppContext,
  useAppContext,
};

export type PluginAPI = typeof pluginAPI;

export const manager = createAsyncManager(hooks, pluginAPI);

export const { createPlugin, registerHook } = manager;

export const getPluginContext = async (plugin: ReturnType<typeof createPlugin>) => {
  const pluginCtx = await runMaybeAsync(plugin.setup, pluginAPI as any);
  if (!pluginCtx) {
    return {};
  }
  return pluginCtx;
};
