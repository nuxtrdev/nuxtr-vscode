/** Detect package managers from the closest project/workspace metadata and build distinct install/script/CLI actions. */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ProcessCommand } from './process';
export type ManagerName = 'NPM' | 'pnpm' | 'Yarn' | 'Bun';
export const managers: ManagerName[] = ['NPM', 'pnpm', 'Yarn', 'Bun'];
const executables: Record<ManagerName, string> = { NPM: 'npm', pnpm: 'pnpm', Yarn: 'yarn', Bun: 'bun' };

/** Prefer explicit packageManager metadata, then the nearest lockfile, then the configured fallback. */
export function detectManager (root: string, fallback?: ManagerName): ManagerName | undefined {
    let directory = root;
    while (true) {
        try {
            const declared = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')).packageManager?.split('@')[0];
            const name = managers.find(manager => executables[manager] === declared);
            if (name) { return name; }
        } catch { /* Missing manifests are normal while walking a monorepo. */ }
        for (const [name, locks] of [['pnpm', ['pnpm-lock.yaml', 'pnpm-workspace.yaml']], ['Bun', ['bun.lock', 'bun.lockb']], ['Yarn', ['yarn.lock']], ['NPM', ['package-lock.json', 'npm-shrinkwrap.json']]] as [ManagerName, string[]][]) {
            if (locks.some(lock => existsSync(join(directory, lock)))) { return name; }
        }
        const parent = dirname(directory);
        if (parent === directory) { break; }
        directory = parent;
    }
    return fallback;
}

/** Build argument arrays so script execution cannot be confused with package installation or CLI execution. */
export function managerCommand (manager: ManagerName, action: 'install' | 'add' | 'remove' | 'script' | 'cli' | 'outdated', cwd: string, values: string[] = [], dev = false): ProcessCommand {
    const executable = executables[manager];
    let args: string[];
    switch (action) {
        case 'install': { args = ['install']; break;
        }
        case 'add': { args = [manager === 'NPM' ? 'install' : 'add', ...values, ...(dev ? ['-D'] : [])]; break;
        }
        case 'remove': { args = [manager === 'NPM' ? 'uninstall' : 'remove', ...values]; break;
        }
        case 'script': { args = ['run', ...values]; break;
        }
        case 'cli': { args = manager === 'NPM' ? ['exec', '--no', '--', ...values] : (manager === 'Bun' ? ['x', '--no-install', ...values] : ['exec', ...values]); break;
        }
        case 'outdated': { return { executable: manager === 'pnpm' ? 'pnpm' : 'npm', args: ['outdated', '--json'], cwd, acceptedExitCodes: [0, 1] };
        }
    }
    return { executable, args, cwd };
}

/** Render typed arguments as a safely quoted terminal command; Windows uses the default PowerShell convention. */
export function terminalCommand (command: ProcessCommand, platform: NodeJS.Platform = process.platform): string {
    return (platform === 'win32' ? '& ' : '') + [command.executable, ...command.args].map(value => platform === 'win32' ? `'${value.replaceAll('\'', '\'\'')}'` : `'${value.replaceAll('\'', '\'"\'"\'')}'`).join(' ');
}
