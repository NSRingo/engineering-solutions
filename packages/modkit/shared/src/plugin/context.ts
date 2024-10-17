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
  return {
    appDirectory,
    distDirectory: path.resolve(appDirectory, distDir),
    nodeModulesDirectory: path.resolve(appDirectory, 'node_modules'),
    ip: address.ip(),
  };
};

type IAppContext = ReturnType<typeof initAppContext>;

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const setAppContext = (value: IAppContext) => AppContext.set(value);

export const useAppContext = () => AppContext.use().value;
