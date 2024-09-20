import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: 'src/index.ts',
    format: 'cjs',
    platform: 'node',
    outDir: 'dist',
    minify: true,
    clean: true,
    sourcemap: false,
    treeshake: true,
    silent: true,
    dts: false,
    external: ['vscode'],
})
