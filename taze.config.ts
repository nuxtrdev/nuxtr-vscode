import { defineConfig } from 'taze'

export default defineConfig({
    force: true,
    write: true,
    install: true,
    packageMode: {
        'nuxi-nightly': 'latest'
    },
    exclude: [
        '@types/vscode'
    ],
    recursive: true
})
