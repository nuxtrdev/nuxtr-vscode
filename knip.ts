/** Audit executable extension/UI entrypoints; treat VS Code APIs and packaged resources as intentional. */
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    workspaces: {
        '.': {
            entry: ['src/index.ts', 'scripts/*.{cjs,mjs}', 'tests/integration/smoke.cjs', 'tests/unit/**/*.test.ts'],
            ignoreDependencies: ['vscode', 'taze', 'terser', 'eslint-config-unjs'],
            ignoreBinaries: ['vsce'],
            ignore: ['taze.config.ts', 'eslint.config.mjs', 'src/content/*.json', 'snippets/**', 'assets/**', 'syntaxes/**'],
            tsup: { config: 'tsup.config.ts' },
        },
        'src/sideBar': {
            entry: ['src/main.ts'],
            project: ['src/**/*.{ts,vue}', '*.{ts,cjs}'],
            ignoreDependencies: ['@types/vscode-webview', 'prettier', 'prettier-plugin-tailwindcss'],
            ignore: ['build/**', 'prettier.config.ts'],
            vite: {
                'config': [
                    'vite.config.ts'
                ]
            }
        }
    },
};

export default config;