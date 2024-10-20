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
import type { ModkitConfig } from '../config';
import { runMaybeAsync } from '../utils';
import { setAppContext, useAppContext } from './context';

type RsbuildDevServer = Awaited<ReturnType<RsbuildInstance['createDevServer']>>;

export interface ModifySourceParams {
  source: ModkitConfig['source'];
}

export interface TemplateParametersParams {
  source: ModkitConfig['source'];
  getFilePath: (fileName: string) => string;
  getScriptPath: (scriptKey: string) => string;
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

export interface PluginHooks {
  /**
   * 配置平台信息
   */
  configurePlatform?: Worker<void, ConfigurePlatformReturn>;
  /**
   * 针对当前平台修改配置
   */
  modifySource?: AsyncWorker<ModifySourceParams, ModkitConfig['source']>;
  /**
   * 注入模板参数
   */
  templateParameters?: Worker<TemplateParametersParams, Record<string, any>>;
  /**
   * 启动开发服务器前
   */
  onBeforeStartDevServer?: AsyncWorker<OnBeforeStartDevServer, void>;
  /**
   * 启动开发服务器后
   */
  onAfterStartDevServer?: AsyncWorker<OnAfterStartDevServer, void>;
  /**
   * 为 commander 添加新的 CLI 命令
   */
  commands?: AsyncWorker<{ program: commander.Command }, void>;
}

const hooks = {
  configurePlatform: createWorkflow<void, ConfigurePlatformReturn>(),
  modifySource: createAsyncWorkflow<ModifySourceParams, ModkitConfig['source']>(),
  templateParameters: createWorkflow<TemplateParametersParams, Record<string, any>>(),
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
