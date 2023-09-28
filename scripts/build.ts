import { execSync } from 'node:child_process'
import fs from 'fs-extra'

async function build() {
    await fs.remove('./out')
    execSync('tsup src/index.ts --format cjs --external vscode --no-shims', { stdio: 'inherit' })

    const files = [
        'LICENSE',
        'README.md',
        'snippets',
        '.vscodeignore',
        'resources',
        'assets',
        'syntaxes',
        'ui'
    ]

    for (const f of files)
    {await fs.copy(`./${f}`, `./out/${f}`)}

    const json = await fs.readJSON('./package.json')
    delete json.scripts
    delete json.devDependencies
    json.main = 'index.js'
    await fs.writeJSON('./out/package.json', json)
}

build()