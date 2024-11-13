export const SUPPORTED_APPS = ['loon', 'surge', 'qx', 'stash', 'egern', 'shadowrocket'] as const;

export type SupportedApp = (typeof SUPPORTED_APPS)[number];

export const APP_LABEL_MAP: Record<SupportedApp, string> = {
  loon: 'Loon',
  surge: 'Surge',
  qx: 'Quantumult X',
  stash: 'Stash',
  egern: 'Egern',
  shadowrocket: 'Shadowrocket',
};

export const APP_INSTALL_INFO_MAP: Record<
  SupportedApp,
  {
    urlTemplate: null | ((url: string) => string);
    manualInstall: {
      urlTitle: string;
      path: string;
    };
  }
> = {
  loon: {
    urlTemplate: (url) => {
      const result = new URL('loon://import');
      result.searchParams.set('plugin', url);
      return result.toString();
    },
    manualInstall: {
      urlTitle: '插件地址',
      path: '配置 > 插件 > 插件',
    },
  },
  surge: {
    urlTemplate: (url) => {
      const result = new URL('surge:///install-module');
      result.searchParams.set('url', url);
      return result.toString();
    },
    manualInstall: {
      urlTitle: '模块地址',
      path: '首页 > 修改 > 模块 > 安装新模块',
    },
  },
  qx: {
    urlTemplate: (url) => {
      const result = new URL('quantumult-x:///add-resource');
      result.searchParams.set('remote-resource', JSON.stringify({ rewrite_remote: [url] }));
      return result.toString();
    },
    manualInstall: {
      urlTitle: '重写路径',
      path: '重写 > 引用',
    },
  },
  stash: {
    urlTemplate: (url) => {
      const result = new URL('stash://install-override');
      result.searchParams.set('url', url);
      return result.toString();
      //return `https://link.stash.ws/install-override/${url.replace(/^https?:\/\//, '')}`;
    },
    manualInstall: {
      urlTitle: '覆写地址',
      path: '首页 > 覆写 > 安装覆写',
    },
  },
  egern: {
    urlTemplate: null,
    manualInstall: {
      urlTitle: '模块地址',
      path: '工具 > 模块',
    },
  },
  shadowrocket: {
    urlTemplate: (url) => {
      const result = new URL('shadowrocket://install');
      result.searchParams.set('module', url);
      return result.toString();
    },
    manualInstall: {
      urlTitle: '模块地址',
      path: '配置 > 模块 > 右上角加号',
    },
  },
};
