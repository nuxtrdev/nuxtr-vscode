/** Retain CI validation logs, candidate identity and VSIX checksums even when a gate fails. */
const { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { createJiti } = require('jiti');

/** Execute a bounded command and preserve complete diagnostics and its actual result. */
async function captureCommand (command, directory, label, metadata = {}) {
    mkdirSync(directory, { recursive: true });
    const report = { ...metadata, startedAt: new Date().toISOString(), status: 'running', platform: process.platform, arch: process.arch, node: process.version };
    const file = join(directory, label + '.json');
    writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
    try {
        const { executeCommand } = await createJiti(__filename).import('../src/core/process.ts');
        const result = await executeCommand(command);
        writeFileSync(join(directory, label + '.log'), result.stdout + '\nSTDERR:\n' + result.stderr);
        const { stdout, stderr, ...outcome } = result;
        Object.assign(report, { status: result.success ? 'passed' : 'failed', finishedAt: new Date().toISOString(), result: outcome });
        // The log retains complete output; keep the identity/result report compact.
        writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
        console.log(stdout); console.error(stderr);
        return result;
    } catch (error) {
        writeFileSync(join(directory, label + '.log'), String(error) + '\n');
        writeFileSync(file, JSON.stringify({ ...report, status: 'failed', finishedAt: new Date().toISOString(), error: String(error) }, null, 2) + '\n');
        throw error;
    }
}

/** Run the shared gate or generated fixtures and associate evidence with the exact checked-out commit. */
async function main () {
    const root = resolve(__dirname, '..');
    const mode = process.argv[2] || 'validation';
    if (!['validation', 'fixtures'].includes(mode)) { throw new Error('Expected validation or fixtures.'); }
    const directory = resolve(process.env.NUXTR_ARTIFACT_DIR || join(root, '.artifacts/release-confidence'));
    process.env.NUXTR_ARTIFACT_DIR = directory;
    mkdirSync(directory, { recursive: true });
    if (mode === 'validation') {
        for (const name of ['nuxtr-validation.vsix', 'nuxtr-sidebar-dark.png', 'nuxtr-sidebar-light.png']) { rmSync(join(directory, name), { force: true }); }
    }
    const metadata = {
        commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
        workingTreeDirty: Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root, encoding: 'utf8' }).trim()),
        vscodeTarget: process.env.VSCODE_TEST_VERSION || 'local-installed-or-minimum',
        runId: process.env.GITHUB_RUN_ID, runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    };
    const result = await captureCommand({ executable: 'pnpm', args: [mode === 'fixtures' ? 'test:fixtures' : 'validate'], cwd: root, timeoutMs: 1_200_000 }, directory, mode, metadata);
    const archive = join(directory, 'nuxtr-validation.vsix');
    if (mode === 'validation' && existsSync(archive)) {
        const bytes = readFileSync(archive);
        const reportFile = join(directory, 'validation.json');
        const report = JSON.parse(readFileSync(reportFile, 'utf8'));
        report.vsix = { file: 'nuxtr-validation.vsix', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), validated: result.success };
        writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    }
    if (!result.success) { throw new Error(`${mode} failed (${result.failure || result.exitCode}); retained evidence in ${directory}`); }
}
if (require.main === module) { main().catch(error => { console.error(error); process.exitCode = 1; }); }
module.exports = { captureCommand };
