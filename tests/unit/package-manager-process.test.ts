/** Execute offline manager launchers, including real Windows .cmd shims, in workspaces with spaces. */
import { chmod, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { executeCommand, requireSuccess } from '../../src/core/process';
import { editModuleConfig, installThenConfigure } from '../../src/core/modules';

let root: string;
let workspace: string;
let originalPath: string | undefined;
const source = '/** Preserve project configuration. */\nexport default defineNuxtConfig({ modules: [], css: ["~/assets/main.css"] })\n';
beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'nuxtr manager space-'));
    workspace = join(root, 'workspace with spaces');
    const binaries = join(root, 'manager binaries');
    await mkdir(workspace); await mkdir(binaries);
    workspace = await realpath(workspace);
    await writeFile(join(workspace, 'nuxt.config.ts'), source);
    const script = join(binaries, 'manager.cjs');
    await writeFile(script, `/** Offline package-manager fixture. */
const fs = require('node:fs');
const args = process.argv.slice(2);
if (args.includes('--fixture-fail')) { process.stderr.write('Fixture installation failed'); process.exitCode = 2; }
else if (args.includes('--fixture-wait')) { fs.writeFileSync('running', 'yes'); setInterval(() => {}, 1000); }
else if (args.includes('--fixture-outdated')) { process.stdout.write('{}'); process.exitCode = 1; }
else { const output = JSON.stringify({ cwd: process.cwd(), args }); process.stdout.write(output.slice(0, 8)); process.stderr.write('Fixture warning'); setTimeout(() => process.stdout.write(output.slice(8)), 15); }
`);
    for (const manager of ['npm', 'pnpm', 'yarn']) {
        const launcher = join(binaries, manager);
        await writeFile(launcher, '#!/usr/bin/env node\nrequire("./manager.cjs");\n');
        await chmod(launcher, 0o755);
        await writeFile(launcher + '.cmd', `@"${process.execPath}" "%~dp0manager.cjs" %*\r\n`);
    }
    originalPath = process.env.PATH;
    process.env.PATH = binaries + delimiter + (originalPath || '');
});
afterEach(async () => {
    if (originalPath === undefined) { delete process.env.PATH; } else { process.env.PATH = originalPath; }
    await rm(root, { recursive: true, force: true });
});

it.each(['npm', 'pnpm', 'yarn'])('executes %s launchers with spaced paths, complete output and literal arguments', async executable => {
    const args = ['run', 'fixture', 'two words', '@scope/module'];
    const result = await executeCommand({ executable, args, cwd: workspace });
    expect(result.success).toBe(true);
    expect(JSON.parse(result.stdout)).toEqual({ cwd: workspace, args });
    expect(result.stderr).toBe('Fixture warning');
});

it('accepts the actual outdated exit code through a package-manager launcher', async () => {
    const result = await executeCommand({ executable: 'pnpm', args: ['--fixture-outdated'], cwd: workspace, acceptedExitCodes: [0, 1] });
    expect(result).toMatchObject({ success: true, exitCode: 1, stdout: '{}' });
});

it('leaves configuration unchanged after failed installation through a launcher', async () => {
    const result = await installThenConfigure(async () => {
        requireSuccess(await executeCommand({ executable: 'npm', args: ['--fixture-fail'], cwd: workspace }));
    }, async () => { await writeFile(join(workspace, 'nuxt.config.ts'), 'Must not configure'); });
    expect(result).toMatchObject({ installed: false, configured: false });
    expect(await readFile(join(workspace, 'nuxt.config.ts'), 'utf8')).toBe(source);
});

it('preserves comments and unrelated options when installation succeeds', async () => {
    const result = await installThenConfigure(async () => {
        requireSuccess(await executeCommand({ executable: 'yarn', args: ['add', '@pinia/nuxt'], cwd: workspace }));
    }, async () => { await writeFile(join(workspace, 'nuxt.config.ts'), editModuleConfig(source, '@pinia/nuxt', 'add')); });
    expect(result).toMatchObject({ installed: true, configured: true });
    const config = await readFile(join(workspace, 'nuxt.config.ts'), 'utf8');
    expect(config).toContain('Preserve project configuration');
    expect(config).toContain('~/assets/main.css');
    expect(config).toContain('@pinia/nuxt');
});

it('settles timeouts through launchers without editing configuration', async () => {
    const result = await executeCommand({ executable: 'pnpm', args: ['--fixture-wait'], cwd: workspace, timeoutMs: 600 });
    expect(result).toMatchObject({ success: false, failure: 'timeout' });
    expect(await readFile(join(workspace, 'nuxt.config.ts'), 'utf8')).toBe(source);
});

it('cancels a running launcher and its process tree without editing configuration', async () => {
    const controller = new AbortController();
    const pending = executeCommand({ executable: 'yarn', args: ['--fixture-wait'], cwd: workspace, timeoutMs: 8000 }, controller.signal);
    try {
        await vi.waitFor(async () => expect(await readFile(join(workspace, 'running'), 'utf8')).toBe('yes'), { timeout: 4000 });
    } finally { controller.abort(); await pending; }
    expect(await pending).toMatchObject({ success: false, failure: 'cancelled' });
    expect(await readFile(join(workspace, 'nuxt.config.ts'), 'utf8')).toBe(source);
}, 10_000);
