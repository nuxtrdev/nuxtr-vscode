/** Extract the validated VSIX and exercise its bundled extension independently of repository runtime resources. */
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, isAbsolute, join, relative, resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { archiveEntries, verifyPackage } = require('./validate.cjs');

/** Check extraction containment and run the regular host harness against the unpacked extension. */
async function main () {
    const archive = process.env.NUXTR_VSIX_PATH || join(tmpdir(), 'nuxtr-validation.vsix');
    verifyPackage(archive);
    const root = mkdtempSync(join(process.platform === 'darwin' ? '/tmp' : tmpdir(), 'nx-vsix-'));
    for (const [name, bytes] of archiveEntries(archive)) {
        if (!name.startsWith('extension/') || name.endsWith('/')) { continue; }
        const path = resolve(root, ...name.slice(10).split('/'));
        const child = relative(root, path);
        assert(child !== '..' && !child.startsWith('..' + require('node:path').sep) && !isAbsolute(child));
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, bytes);
    }
    await new Promise((done, reject) => {
        const child = spawn(process.execPath, [join(__dirname, 'test-extension.cjs'), 'empty', 'nuxt', 'nuxt4', 'two-projects'], { stdio: 'inherit', env: { ...process.env, NUXTR_EXTENSION_PATH: root } });
        child.on('error', reject);
        child.on('exit', code => code === 0 ? done() : reject(new Error('Packaged host tests failed: ' + code)));
    });
    console.log('PASS: isolated packaged VSIX activation, sidebar, snippets and project contexts');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
