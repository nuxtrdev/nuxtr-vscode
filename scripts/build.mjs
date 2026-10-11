/** Clean once, then build the extension and sidebar without either bundler deleting the other's assets. */
import { rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

/** Run a workspace tool through Node so builds work without shell command or .cmd quoting. */
function build (binary, args, cwd) {
    return new Promise((done, reject) => {
        const child = spawn(process.execPath, [binary, ...args], { cwd, stdio: 'inherit' });
        child.on('error', reject);
        child.on('exit', code => code === 0 ? done() : reject(new Error(`Build failed with exit code ${code}`)));
    });
}
await rm(resolve(root, 'out'), { recursive: true, force: true });
await build(resolve(dirname(require.resolve('tsup/package.json')), 'dist/cli-default.js'), [], root);
await build(resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js'), ['build'], resolve(root, 'src/sideBar'));
