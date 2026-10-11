/** Verify successful installation can configure the project while its informational toast is still open. */
import { beforeEach, expect, it, vi } from 'vitest';
const host = vi.hoisted(() => ({
    toast: undefined as unknown as Promise<string | undefined>,
    settleToast: undefined as unknown as (choice?: string) => void,
    open: vi.fn().mockResolvedValue(true), error: vi.fn(), dispose: vi.fn(), configure: vi.fn(),
}));
vi.mock('vscode', () => ({
    ProgressLocation: { Notification: 15 },
    workspace: { isTrusted: true },
    window: {
        withProgress: (_options: unknown, callback: any) => callback({}, { onCancellationRequested: () => ({ dispose: host.dispose }) }),
        showInformationMessage: vi.fn(() => host.toast),
        showInputBox: vi.fn().mockResolvedValue('counter'),
        showErrorMessage: host.error,
    },
    env: { openExternal: host.open }, Uri: { parse: (url: string) => url },
}));
vi.mock('../../src/services/project', () => ({ currentProject: () => ({ root: process.cwd() }) }));
vi.mock('../../src/utils/outputChannel', () => ({ logger: { log: vi.fn() } }));
import { runProjectCommand } from '../../src/services/process';
import { createStore } from '../../src/commands/store';
vi.mock('../../src/utils/files', () => ({ scaffoldExtension: () => '.ts' }));
vi.mock('../../src/utils/nuxt', () => ({ projectDirectory: () => '/fixture/stores' }));
vi.mock('../../src/templates', () => ({ vuexContent: '' }));
vi.mock('../../src/utils', () => ({
    createFile: vi.fn().mockResolvedValue(true), generatePiniaTemplates: () => '',
    isDependencyInstalled: vi.fn().mockResolvedValue(false), isModuleConfigured: () => false,
    isNuxtTwo: () => false, normalizeFileExtension: (name: string) => name,
    getInstallationCommand: () => ({ executable: process.execPath, args: ['-e', 'process.stdout.write("installed")'], cwd: process.cwd() }),
    runCommand: (notification: any) => runProjectCommand(notification), updateNuxtConfig: host.configure,
}));
beforeEach(() => {
    vi.clearAllMocks();
    host.open.mockResolvedValue(true);
    host.toast = new Promise(resolve => { host.settleToast = resolve; });
});

it('finishes the process without awaiting dismissal of the success notification', async () => {
    const output = await runProjectCommand({
        command: { executable: process.execPath, args: ['-e', 'process.stdout.write("installed")'], cwd: process.cwd() },
        message: 'Installing fixture module', successMessage: 'Installed', errorMessage: 'Failed'
    });
    expect(output).toBe('installed');
}, 1000);

it('completes actual Pinia store configuration with its documentation toast still open', async () => {
    await createStore();
    expect(host.configure).toHaveBeenCalledWith('add-module', '@pinia/nuxt');
    expect(host.dispose).toHaveBeenCalledOnce();
    expect(host.open).not.toHaveBeenCalled();
}, 1000);

it('opens documentation after the process has completed when the user chooses the action', async () => {
    await runProjectCommand({ command: { executable: process.execPath, args: ['-e', ''], cwd: process.cwd() }, message: 'Install', successMessage: 'Installed', errorMessage: 'Failed', docsURL: 'https://pinia.vuejs.org/' });
    expect(host.dispose).toHaveBeenCalledOnce();
    host.settleToast('Open documentation');
    await vi.waitFor(() => expect(host.open).toHaveBeenCalledWith('https://pinia.vuejs.org/'));
});

it.each([false, new Error('Browser unavailable')])('keeps successful configuration separate from documentation failure: %s', async failure => {
    if (failure instanceof Error) { host.open.mockRejectedValue(failure); } else { host.open.mockResolvedValue(failure); }
    await createStore();
    expect(host.configure).toHaveBeenCalledOnce();
    host.settleToast('Open documentation');
    await vi.waitFor(() => expect(host.error).toHaveBeenCalledWith(expect.stringContaining('documentation')));
    expect(host.error).not.toHaveBeenCalledWith(expect.stringContaining('installation failed'));
    expect(host.configure).toHaveBeenCalledOnce();
});

it('does not open documentation when the completed notification is dismissed', async () => {
    await createStore();
    host.settleToast();
    await new Promise(resolve => setImmediate(resolve));
    expect(host.open).not.toHaveBeenCalled();
    expect(host.error).not.toHaveBeenCalled();
});
