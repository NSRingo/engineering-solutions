import { createAsyncManager, createAsyncWorkflow } from '@modern-js/plugin';

const baseHooks = {
  modifyConfig: createAsyncWorkflow(),
  processArguments: createAsyncWorkflow(),
};

export const manager = createAsyncManager(baseHooks);

export const { createPlugin, registerHook } = manager;
