/** Bundle extension runtime dependencies into the CommonJS entrypoint loaded by VS Code. */
import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [ 'src/index.ts', ],
    outDir: 'out',
    format: ['cjs'],
    shims: false,
    dts: false,
    splitting: false,
    clean: false,
    minify: 'terser',
    platform: 'node',
    sourcemap: false,
    treeshake: true,
    minifySyntax: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    target: 'es2022',
    external: ['vscode'],
    noExternal: [
        '@nuxt/schema',
        'magicast',
        'ofetch',
        'pathe',
        'pkg-types',
        'string-ts',
        'giget',
        'semver',
        'yaml'
    ]
})
