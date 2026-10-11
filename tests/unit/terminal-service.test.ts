/** Exercise actual terminal dispatch through shell lifecycle callbacks, scoped settings and project changes. */
import { beforeEach, expect, test, vi } from 'vitest';
import type { ExtensionContext } from 'vscode';
import { activateTerminals, newProjectTerminal } from '../../src/services/terminals';
const host = vi.hoisted(() => ({ reuse: false, root: '/project with spaces', callbacks: {} as Record<string, (event: any) => void>, create: vi.fn(), subscriptions: [] as any[] }));
vi.mock('vscode', () => ({
    ThemeIcon: class ThemeIcon {}, Uri: { file: (fsPath: string) => ({ scheme: 'file', fsPath }) },
    workspace: { getConfiguration: () => ({ get: () => host.reuse }) },
    window: {
        createTerminal: host.create,
        onDidStartTerminalShellExecution: (callback: any) => { host.callbacks.start = callback; return { dispose () {} }; },
        onDidEndTerminalShellExecution: (callback: any) => { host.callbacks.end = callback; return { dispose () {} }; },
        onDidChangeTerminalShellIntegration: (callback: any) => { host.callbacks.integration = callback; return { dispose () {} }; },
        onDidCloseTerminal: (callback: any) => { host.callbacks.close = callback; return { dispose () {} }; },
    },
}));
vi.mock('../../src/services/project', () => ({ currentProject: () => ({ root: host.root }) }));
beforeEach(() => {
    for (const subscription of host.subscriptions) { subscription.dispose(); }
    host.subscriptions = []; host.reuse = false; host.root = '/project with spaces'; host.create.mockReset();
    host.create.mockImplementation(options => ({ options, sendText: vi.fn(), show: vi.fn(), shellIntegration: { cwd: { scheme: 'file', fsPath: options.cwd } } }));
    activateTerminals({ subscriptions: host.subscriptions } as ExtensionContext);
});
/** Simulate a complete shell command with a reliable completion result. */
function finish (terminal: any) { const execution = {}; host.callbacks.start({ terminal, execution }); host.callbacks.end({ terminal, execution, exitCode: 0 }); }
test('reuse is disabled by default and does not adopt a user terminal', () => {
    const terminal = newProjectTerminal('Install', 'pnpm install'); finish(terminal);
    expect(newProjectTerminal('Info', 'pnpm exec nuxt info')).not.toBe(terminal);
    expect(host.create).toHaveBeenCalledTimes(2);
});
test('enabled reuse dispatches a new command only after the previous shell command ends', () => {
    host.reuse = true;
    const terminal = newProjectTerminal('Install', 'pnpm install'); finish(terminal);
    expect(newProjectTerminal('Info', 'pnpm exec nuxt info')).toBe(terminal);
    expect(terminal.sendText).toHaveBeenLastCalledWith('pnpm exec nuxt info');
    expect(newProjectTerminal('Build', 'pnpm exec nuxt build')).not.toBe(terminal);
    expect(host.create).toHaveBeenCalledTimes(2);
});
test('a busy dev server, missing integration and changed cwd always create a new terminal', () => {
    host.reuse = true;
    const dev = newProjectTerminal('Dev', 'pnpm dev'); host.callbacks.start({ terminal: dev, execution: {} });
    const missing = newProjectTerminal('Install', 'pnpm install'); finish(missing); (missing as any).shellIntegration = undefined;
    const moved = newProjectTerminal('Info', 'pnpm info'); finish(moved); (moved as any).shellIntegration.cwd.fsPath = '/elsewhere';
    newProjectTerminal('Build', 'pnpm build');
    expect(host.create).toHaveBeenCalledTimes(4);
    expect(dev.sendText).toHaveBeenCalledTimes(1);
});
test('different projects cannot reuse a shared workspace terminal and closing a terminal removes ownership', () => {
    host.reuse = true;
    const terminal = newProjectTerminal('Install', 'pnpm install', '/workspace'); finish(terminal);
    host.root = '/other-project';
    expect(newProjectTerminal('Install', 'pnpm install', '/workspace')).not.toBe(terminal);
    host.root = '/project with spaces'; host.callbacks.close(terminal);
    expect(newProjectTerminal('Install', 'pnpm install', '/workspace')).not.toBe(terminal);
});
test('shell restart invalidates previously idle state without stopping running terminals on disposal', () => {
    host.reuse = true;
    const terminal = newProjectTerminal('Info', 'pnpm info'); finish(terminal); host.callbacks.integration({ terminal });
    expect(newProjectTerminal('Info', 'pnpm info')).not.toBe(terminal);
    for (const subscription of host.subscriptions) { subscription.dispose(); }
    expect(terminal.sendText).toHaveBeenCalledTimes(1);
});
