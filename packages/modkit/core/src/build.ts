// import type { ModkitConfig } from '@iringo/modkit-shared';
import { type ModkitConfig, address } from '@iringo/modkit-shared';
import { RsbuildConfig, createRsbuild, mergeRsbuildConfig } from '@rsbuild/core';
import type { loadPlugins } from './load-plugins';

// export function useBuildScript(config: ModkitConfig<any>) {
//   const isProduction = process.env.NODE_ENV === 'production';

//   createRsbuild({
//     rsbuildConfig: mergeRsbuildConfig(),
//   });

//   // const compiler = rspackCore.rspack(
//   //   lodash.merge(
//   //     DEFAULT_RSPACK_CONFIG,
//   //     defineRsPackConfig({
//   //       mode: isProduction ? 'production' : 'development',
//   //       output: {
//   //         clean: isProduction,
//   //       },
//   //     }),
//   //     config.tools?.rspack || {},
//   //     defineRsPackConfig({
//   //       entry: config.source?.scripts || {},
//   //     }),
//   //   ),
//   // );

//   // return { compiler };
// }

export const useRsbuild = (config: ModkitConfig<any>, plugins: ReturnType<typeof loadPlugins>) => {
  createRsbuild({
    rsbuildConfig: mergeRsbuildConfig({
      output: {
        assetPrefix: config.output?.assetPrefix,
        distPath: {
          root: config.output?.distPath?.root,
        },
      },
      dev: {
        assetPrefix: `http://${address.ip()}:${config.dev?.port ?? 3000}`,
      },
    }),
  });
};
