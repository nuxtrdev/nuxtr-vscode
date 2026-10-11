/** Package-manager regressions for Bun lock variants, fallback settings and script/CLI separation (#177). */
import { afterEach, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectManager, managerCommand } from '../../src/core/managers';
const folders: string[] = [];
afterEach(() => { for (const root of folders.splice(0)) { rmSync(root, { recursive: true, force: true }); } });
/** Build an isolated temporary package-manager workspace. */
function fixture () { const root = mkdtempSync(join(tmpdir(), 'nuxtr-manager-')); folders.push(root); return root; }
it.each(['bun.lock', 'bun.lockb'])('detects %s', (lock) => {
    const root = fixture(); writeFileSync(join(root, lock), ''); expect(detectManager(root)).toBe('Bun');
});
it('finds the parent workspace manager and honors explicit fallback without a lock', () => {
    const root = fixture(); mkdirSync(join(root, 'app'));
    writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages: [app]'); expect(detectManager(join(root, 'app'))).toBe('pnpm');
    expect(detectManager(fixture(), 'Bun')).toBe('Bun');
});
it('distinguishes scripts from local CLI and dependency installs across all managers', () => {
    for (const manager of ['NPM', 'pnpm', 'Yarn', 'Bun'] as const) {
        expect(managerCommand(manager, 'script', '/project', ['dev']).args).toEqual(['run', 'dev']);
        expect(managerCommand(manager, 'cli', '/project', ['nuxt', 'dev']).args).not.toEqual(['run', 'nuxt', 'dev']);
        expect(managerCommand(manager, 'add', '/project', ['@nuxt/test'], true).args).toContain('-D');
    }
});

it('preserves quotes and shell-looking text when rendering a POSIX terminal command', async () => {
    const { terminalCommand } = await import('../../src/core/managers');
    const { executeCommand } = await import('../../src/core/process');
    if (process.platform === 'win32') { return; }
    const value = 'one\'s $(printf EXPANDED)';
    const command = terminalCommand({ executable: process.execPath, args: ['-e', 'process.stdout.write(process.argv[1])', value], cwd: fixture() });
    const result = await executeCommand({ executable: '/bin/sh', args: ['-c', command], cwd: fixture() });
    expect(result.stdout).toBe(value);
    expect(result.success).toBe(true);
});

it('renders Windows terminal arguments for the explicitly selected PowerShell profile', async () => {
    const { terminalCommand } = await import('../../src/core/managers');
    expect(terminalCommand({ executable: 'pnpm', args: ['add', 'one\'s literal $value'], cwd: '.' }, 'win32')).toBe('& \'pnpm\' \'add\' \'one\'\'s literal $value\'');
});
