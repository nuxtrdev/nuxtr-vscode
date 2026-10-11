/** Resolve only documented executable entrypoints from the project's installed Nuxt CLI. */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { terminalCommand } from '../core/managers';
import { projectRootDirectory } from '../utils/global';

/** Find a project-local CLI binary without importing or executing the CLI's private module API. */
export function resolveNuxtCLI (root: string): string {
    const requireFromProject = createRequire(resolve(root, 'package.json'));
    for (const name of ['nuxt', '@nuxt/cli', 'nuxi']) {
        try {
            const manifestPath = requireFromProject.resolve(`${name}/package.json`);
            const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
            const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.nuxt || manifest.bin?.nuxi;
            if (typeof bin === 'string') {
                const executable = resolve(dirname(manifestPath), bin);
                if (existsSync(executable)) { return executable; }
            }
        } catch { /* Try the next documented package entrypoint. */ }
    }
    throw new Error('The project-local Nuxt CLI is missing. Install this project’s dependencies first.');
}

/** Build a terminal command from the local public CLI binary and individually quoted arguments. */
export function nuxtCLICommand (args: string[]): string {
    return terminalCommand({ executable: 'node', args: [resolveNuxtCLI(projectRootDirectory()), ...args], cwd: projectRootDirectory() });
}
