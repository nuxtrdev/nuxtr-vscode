import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    workspaces: {
        '.': {
            entry: 'src/index.ts',
            ignoreDependencies: ['taze', 'terser', 'eslint-config-unjs'],
            ignoreBinaries: ['vsce'],
            ignore: ['taze.config.ts', 'eslint.config.mjs'],
            // TODO: replace tsup with tsdown
            tsup: { config: 'tsup.config.ts' },
        },
        'src/sideBar': {
            ignoreDependencies: ['ofetch', '@types/vscode-webview', 'prettier', 'prettier-plugin-tailwindcss'],
            ignore: ['build/**', 'prettier.config.ts'],
            vite: {
                "config": [
                    "vite.config.ts"
                ]
            }
        }
    },
};

export default config;