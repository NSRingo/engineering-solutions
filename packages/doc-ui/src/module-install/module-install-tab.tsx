import { Children, cloneElement, createElement, isValidElement } from 'react';
import { Tab } from 'rspress/theme';
import type { SupportedApp } from './constants';

export interface ModuleInstallTabProps {
  type: SupportedApp;
  __urlPrefix?: string;
  children?: React.ReactNode;
}

export const ModuleInstallTab: React.FC<ModuleInstallTabProps> = ({ type: appType, __urlPrefix, children }) => {
  return (
    <Tab key={appType}>
      <div className="text-sm">
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            const childType = child.type;
            if (
              typeof childType !== 'string' &&
              'displayName' in childType &&
              childType.displayName === 'ModuleInstallItem'
            ) {
              return cloneElement(child, { __appType: appType, __urlPrefix } as any);
            }
            return createElement(
              'div',
              {
                className: 'px-3',
              },
              child,
            );
          }
          return child;
        })}
      </div>
    </Tab>
  );
};
