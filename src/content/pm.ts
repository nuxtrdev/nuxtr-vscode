const pm = [
    {
        name: 'NPM',
        lockFile: 'package-lock.json',
        installCommand: 'npm install',
        uninstallCommand: 'npm uninstall',
    },
    {
        name: 'Yarn',
        lockFile: 'yarn.lock',
        installCommand: 'yarn install',
        uninstallCommand: 'yarn remove',
    },
    {
        name: 'pnpm',
        lockFile: 'pnpm-lock.yaml',
        installCommand: 'pnpm install',
        uninstallCommand: 'pnpm remove',
    },
    {
        name: 'Bun',
        lockFile: 'bun.lockb',
        installCommand: 'bun install',
        uninstallCommand: 'bun remove',
    }
]

export default pm
