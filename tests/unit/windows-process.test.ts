/** Guard the Windows CMD quoting contract that previously turned pnpm validate into a literal quoted script name. */
import { afterEach, expect, it, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { executeCommand } from '../../src/core/process';

vi.mock('node:child_process', async () => {
    const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process');
    return { ...actual, spawn: vi.fn((executable, args, options) => actual.spawn(process.execPath, ['-e', 'process.stdout.write("transport finished")'], { cwd: options.cwd, stdio: ['ignore', 'pipe', 'pipe'] })) };
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it('passes the already-quoted CMD string verbatim instead of escaping the quotes again', async () => {
    const original = process;
    vi.stubGlobal('process', new Proxy(original, { get: (target, key) => key === 'platform' ? 'win32' : Reflect.get(target, key) }));
    const result = await executeCommand({ executable: 'pnpm', args: ['validate', 'two words'], cwd: original.cwd() });
    expect(result.success).toBe(true);
    expect(spawn).toHaveBeenCalledWith('cmd.exe', ['/d', '/s', '/c', 'pnpm "validate" "two words"'], expect.objectContaining({ windowsVerbatimArguments: true }));
});

it('keeps normal Node quoting for native executables', async () => {
    const original = process;
    vi.stubGlobal('process', new Proxy(original, { get: (target, key) => key === 'platform' ? 'win32' : Reflect.get(target, key) }));
    await executeCommand({ executable: original.execPath, args: ['-e', 'process.stdout.write("two words")'], cwd: original.cwd() });
    expect(spawn).toHaveBeenCalledWith(original.execPath, expect.any(Array), expect.not.objectContaining({ windowsVerbatimArguments: true }));
});

it('rejects CMD interpolation and operators before spawning the verbatim command', async () => {
    const original = process;
    vi.stubGlobal('process', new Proxy(original, { get: (target, key) => key === 'platform' ? 'win32' : Reflect.get(target, key) }));
    for (const value of ['%PATH%', '!value!', 'a&b', 'a|b', 'a"b', 'a\nb']) {
        await expect(executeCommand({ executable: 'pnpm', args: [value], cwd: original.cwd() })).rejects.toThrow('Unsupported Windows command argument');
    }
    expect(spawn).not.toHaveBeenCalled();
});
