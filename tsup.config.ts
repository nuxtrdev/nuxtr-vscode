import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [
        'src/index.ts',
    ],
    outDir: "out",
    format: ['cjs'],
    shims: false,
    dts: false,
    splitting: false,
    clean: true,
    minify: true,
    platform: 'node',
    sourcemap: false,
    external: [
        'vscode',
    ],
    noExternal: [
        "@nuxt/schema",
        "axios",
        "destr",
        "fs-extra",
        "jiti",
        "magicast",
        "nuxi-edge",
        "path",
        "pkg-types",
        "util",
    ]

})
