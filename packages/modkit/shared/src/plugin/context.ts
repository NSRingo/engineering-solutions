import path from 'node:path';
import { address } from '@iringo/utils';
import { createContext } from '@modern-js/plugin';

export const initAppContext = ({
  appDirectory,
  distDir = 'dist',
}: {
  appDirectory: string;
  distDir?: string;
}) => {
  const nodeModulesDirectory = path.resolve(appDirectory, 'node_modules');
  return {
    appDirectory,
    distDirectory: path.resolve(appDirectory, distDir),
    nodeModulesDirectory,
    cacheDirectory: path.resolve(nodeModulesDirectory, '.modkit'),
    ip: address.ip(),
  };
};

export type IAppContext = ReturnType<typeof initAppContext>;

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const setAppContext = (value: IAppContext) => AppContext.set(value);

export const useAppContext = () => AppContext.use().value;
