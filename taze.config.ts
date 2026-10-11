/** Read-only dependency reports; updates and installation require explicit CLI flags. */
import { defineConfig } from 'taze'

export default defineConfig({
    force: false,
    write: false,
    install: false,
    exclude: [
        '@types/vscode'
    ],
    recursive: true
})
