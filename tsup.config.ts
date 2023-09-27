import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [
        'src/index.ts',
    ],
    format: ['cjs'],
    shims: false,
    dts: false,
    splitting: false,
    clean: true,
    external: [
        'vscode',
    ],
})