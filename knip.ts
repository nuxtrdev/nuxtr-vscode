import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    workspaces: {
        '.': {
            entry: 'src/index.ts',
            ignoreDependencies: ['taze', 'terser'],
            ignoreBinaries: ['vsce'],
            ignore: ['taze.config.ts'],
            tsup: { config: 'tsup.config.ts' },
        },
    },
    ignoreWorkspaces: ['ui']
};

export default config;