import { defineConfig } from 'taze'

export default defineConfig({
    force: true,
    write: true,
    install: true,
    packageMode: {
        'nuxi-edge': 'latest'
    }
})