/** Verify busy, unobserved, unrelated and changed-directory terminals cannot receive reused commands. */
import { expect, test } from 'vitest';
import { TerminalPool } from '../../src/core/terminals';
test('new terminals remain unavailable until an observed command finishes', () => {
    const pool = new TerminalPool<string, string>();
    pool.own('terminal', '/project', '/project');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    pool.end('terminal', 'unknown');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    pool.start('terminal', 'install'); pool.end('terminal', 'install');
    expect(pool.reserve('/project', '/project', () => true)).toBe('terminal');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
});
test('reuse requires the same project, requested cwd and eligible live shell directory', () => {
    const pool = new TerminalPool<string, string>();
    pool.own('terminal', '/project', '/workspace'); pool.start('terminal', 'install'); pool.end('terminal', 'install');
    expect(pool.reserve('/other', '/workspace', () => true)).toBeUndefined();
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    expect(pool.reserve('/project', '/workspace', () => false)).toBeUndefined();
    expect(pool.reserve('/project', '/workspace', () => true)).toBe('terminal');
});
test('manual and overlapping executions block reuse until every execution ends', () => {
    const pool = new TerminalPool<string, string>();
    pool.own('terminal', '/project', '/project'); pool.start('terminal', 'dev'); pool.start('terminal', 'manual');
    pool.end('terminal', 'manual');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    pool.end('terminal', 'dev');
    expect(pool.reserve('/project', '/project', () => true)).toBe('terminal');
});
test('unreliable ends, changed integration and closed terminals are not reusable', () => {
    const pool = new TerminalPool<string, string>();
    pool.own('terminal', '/project', '/project'); pool.start('terminal', 'install'); pool.end('terminal', 'install', false);
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    pool.start('terminal', 'manual'); pool.end('terminal', 'manual'); pool.invalidate('terminal');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    pool.start('terminal', 'manual2'); pool.end('terminal', 'manual2'); pool.forget('terminal');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
});
test('user-owned terminals cannot enter the pool and disposal forgets owned sessions', () => {
    const pool = new TerminalPool<string, string>();
    pool.start('user-terminal', 'manual'); pool.end('user-terminal', 'manual');
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
    pool.own('terminal', '/project', '/project'); pool.start('terminal', 'install'); pool.end('terminal', 'install'); pool.clear();
    expect(pool.reserve('/project', '/project', () => true)).toBeUndefined();
});
