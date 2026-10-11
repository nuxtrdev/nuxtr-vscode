/** Verify retained evidence identifies actual command results, including failed validation. */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { parse } from 'yaml';
import { captureCommand } from '../../scripts/ci-validate.cjs';

const directories: string[] = [];
afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

it.each([0, 2])('retains stdout, stderr, identity and actual exit status %s', async exitCode => {
    const directory = await mkdtemp(join(tmpdir(), 'nuxtr evidence '));
    directories.push(directory);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await captureCommand({ executable: process.execPath, args: ['-e', `process.stdout.write('complete output'); process.stderr.write('diagnostic'); process.exitCode = ${exitCode}`], cwd: directory }, directory, 'validation', { commit: 'candidate', vscodeTarget: '1.141.0' });
    expect(result).toMatchObject({ success: exitCode === 0, exitCode, stdout: 'complete output', stderr: 'diagnostic' });
    expect(await readFile(join(directory, 'validation.log'), 'utf8')).toContain('complete output\nSTDERR:\ndiagnostic');
    const report = JSON.parse(await readFile(join(directory, 'validation.json'), 'utf8'));
    expect(report).toMatchObject({ commit: 'candidate', vscodeTarget: '1.141.0', platform: process.platform, status: exitCode === 0 ? 'passed' : 'failed', result: { exitCode, success: exitCode === 0 } });
    expect(report.startedAt).toBeTruthy();
    expect(report.finishedAt).toBeTruthy();
});

it('keeps six independently dispatched CI targets and retains evidence even on failure', async () => {
    const workflow = parse(await readFile(join(import.meta.dirname, '../../.github/workflows/ci.yml'), 'utf8'));
    expect(workflow.on).toHaveProperty('workflow_dispatch');
    const job = workflow.jobs.validate;
    expect(job.strategy.matrix.os).toEqual(['ubuntu-latest', 'windows-latest', 'macos-latest']);
    expect(job.strategy.matrix.vscode).toEqual(['1.141.0', 'stable']);
    expect(job.strategy['fail-fast']).toBe(false);
    const upload = job.steps.find((step: { uses?: string }) => step.uses?.startsWith('actions/upload-artifact@'));
    expect(upload.if).toBe('always()');
    expect(upload.with.name).toContain('${{ matrix.os }}-${{ matrix.vscode }}');
    expect(upload.with.path).toBe('.artifacts/release-confidence/');
});
