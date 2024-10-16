import { type ModkitConfig, lodash, rspackCore } from '@iringo/modkit-shared';

const DEFAULT_RSPACK_CONFIG: rspackCore.RspackOptions = {
  context: process.env.MODKIT_ROOT || process.cwd(),
  output: {
    chunkFormat: 'module',
    asyncChunks: false,
  },
  performance: false,
};
const defineRsPackConfig = (config: rspackCore.RspackOptions) => config;

export function useBuildScript(config: ModkitConfig<any>) {
  const isProduction = process.env.NODE_ENV === 'production';

  const compiler = rspackCore.rspack(
    lodash.merge(
      DEFAULT_RSPACK_CONFIG,
      defineRsPackConfig({
        mode: isProduction ? 'production' : 'development',
        output: {
          clean: isProduction,
        },
      }),
      config.tools?.rspack || {},
      defineRsPackConfig({
        entry: config.source?.scripts || {},
      }),
    ),
  );

  return { compiler };
}
