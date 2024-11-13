import fs from 'node:fs';
import path from 'node:path';
import type { ModkitPlugin } from '@iringo/modkit-shared';
import { Surge2Egern } from '@iringo/surge2egern';

export const pluginEgern = (): ModkitPlugin => {
  return {
    name: 'egern',

    setup() {
      return {
        async onAfterBuild({ distPath }) {
          if (!distPath || !fs.existsSync(distPath)) {
            return;
          }
          const surgeModules = fs.readdirSync(distPath).reduce<string[]>((acc, file) => {
            if (path.extname(file) === '.sgmodule') {
              acc.push(path.join(distPath, file));
            }
            return acc;
          }, []);
          const surge2egern = new Surge2Egern();
          await Promise.allSettled(
            surgeModules.map(async (surgeModule) => {
              const text = await fs.promises.readFile(surgeModule, 'utf-8');
              const result = await surge2egern.transformModule(text);
              const targetPath = surgeModule.replace('.sgmodule', '.yaml');
              return fs.promises.writeFile(targetPath, result);
            }),
          );
          surge2egern.destroy();
        },
      };
    },
  };
};
