import type { Server } from 'node:http';
import { type commander, logger } from '@iringo/utils';
import {
  type AsyncManager,
  type AsyncWorker,
  type Worker,
  createAsyncManager,
  createAsyncWorkflow,
  createWorkflow,
} from '@modern-js/plugin';
import type { RsbuildInstance } from '@rsbuild/core';
import type { Express } from 'express';
import type { ArgumentItem, ModkitConfig } from '../config';
import { runMaybeAsync } from '../utils';
import { setAppContext, useAppContext } from './context';

type RsbuildDevServer = Awaited<ReturnType<RsbuildInstance['createDevServer']>>;

export interface ModifySourceParams<T extends Record<string, string>> {
  source: ModkitConfig<T>['source'];
}

export interface ConfigurePlatformReturn {
  /**
   * 拓展名
   */
  extension: `.${string}`;
  /**
   * 渲染模板
   */
  template: string;
}

export interface OnBeforeStartDevServer {
  app: Express;
}

export interface OnAfterStartDevServer {
  app: Express;
  httpServer: Server;
  rsbuildServer: RsbuildDevServer;
}

export interface PluginHooks<T extends Record<string, string>> {
  /**
   * 配置平台信息
   */
  configurePlatform?: Worker<void, ConfigurePlatformReturn>;
  /**
   * 针对当前平台修改配置
   */
  modifySource?: AsyncWorker<ModifySourceParams<T>, ModkitConfig<T>['source']>;
  /**
   * 处理参数
   */
  processArguments?: AsyncWorker<{ args: ArgumentItem[] }, Record<string, any>>;

  onBeforeStartDevServer?: AsyncWorker<OnBeforeStartDevServer, void>;
  onAfterStartDevServer?: AsyncWorker<OnAfterStartDevServer, void>;

  /**
   * 为 commander 添加新的 CLI 命令
   */
  commands?: AsyncWorker<{ program: commander.Command }, void>;
}

const hooks = {
  configurePlatform: createWorkflow<void, ConfigurePlatformReturn>(),
  modifySource: createAsyncWorkflow<ModifySourceParams<any>, ModkitConfig<any>['source']>(),
  processArguments: createAsyncWorkflow<{ args: ArgumentItem[] }, Record<string, any>>(),
  onBeforeStartDevServer: createAsyncWorkflow<OnBeforeStartDevServer, void>(),
  onAfterStartDevServer: createAsyncWorkflow<OnAfterStartDevServer, void>(),
  commands: createAsyncWorkflow<{ program: commander.Command }, void>(),
};

export const pluginAPI = {
  setAppContext,
  useAppContext,
  logger,
};

export type PluginAPI = typeof pluginAPI;

export const manager = createAsyncManager(hooks, pluginAPI);

export const { createPlugin, registerHook } = manager;

export type PluginType = ReturnType<AsyncManager<typeof hooks, PluginAPI>['createPlugin']>;

export const getPluginContext = async (plugin: ReturnType<typeof createPlugin>) => {
  const pluginCtx = await runMaybeAsync(plugin.setup, pluginAPI as any);
  if (!pluginCtx) {
    return {};
  }
  return pluginCtx;
};
