/** Watch extension and sidebar builds concurrently while preserving each other's generated output. */
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const children = [
    spawn(process.execPath, [resolve(dirname(require.resolve('tsup/package.json')), 'dist/cli-default.js'), '--watch'], { cwd: root, stdio: 'inherit' }),
    spawn(process.execPath, [resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js'), 'build', '--watch'], { cwd: resolve(root, 'src/sideBar'), stdio: 'inherit' })
];
let stopping = false;
/** Stop both watchers when the development task ends or either child fails. */
function stop (code = 0) {
    if (stopping) { return; }
    stopping = true;
    process.exitCode = code;
    for (const child of children) { child.kill(); }
}
for (const signal of ['SIGINT', 'SIGTERM']) { process.on(signal, () => stop()); }
for (const child of children) { child.on('error', error => { console.error(error); stop(1); }); child.on('exit', code => { if (!stopping) { stop(code || 1); } }); }
