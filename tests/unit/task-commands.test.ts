/** Regressions for Nitro task palette visibility and Explorer commands invoked without a resource. */
import { readFileSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import { ExtensionContext, Uri } from 'vscode';
import { activateExtension } from '../../src/extension';

const host = vi.hoisted(() => ({
    handlers: new Map<string, (...args: any[]) => any>(),
    createTask: vi.fn(), directTask: vi.fn(), error: vi.fn(), selectProject: vi.fn(),
}));
vi.mock('vscode', () => ({
    Uri: class Uri {
        /** Represent the Explorer resource supplied by VS Code. */
        constructor (public fsPath: string) {}
        /** Create a file resource for command invocation tests. */
        static file (path: string) { return new this(path); }
    },
    commands: {
        registerCommand: (name: string, callback: (...args: any[]) => any) => {
            host.handlers.set(name, callback);
            return { dispose: vi.fn() };
        },
    },
    window: { showErrorMessage: host.error, registerWebviewViewProvider: vi.fn() },
}));
vi.mock('../../src/services/terminals', () => ({ activateTerminals: vi.fn() }));
vi.mock('../../src/commands/wrapComponent', () => ({ wrapWithNuxtComponent: vi.fn() }));
vi.mock('../../src/commands/projectHealth', () => ({ projectHealthCheck: vi.fn() }));
vi.mock('../../src/commands', () => ({ default: { createNitroTask: host.createTask, directCreateNitroTask: host.directTask } }));
vi.mock('../../src/services/project', () => ({ selectProject: host.selectProject, withProject: (_project: unknown, action: () => any) => action() }));
vi.mock('../../src/snippets', () => ({ activateSnippets: vi.fn() }));
vi.mock('../../src/sideBar', () => ({ ModulesView: class ModulesView {} }));
vi.mock('../../src/utils', () => ({ logger: { log: vi.fn() }, projectRootDirectory: vi.fn(), updateDependencies: vi.fn() }));
vi.mock('../../src/codelens', () => ({ default: { activateCodelenses: vi.fn() } }));
vi.mock('../../src/statusBar', () => ({ activateStatusBarIcons: vi.fn(), statusBars: {} }));
vi.mock('../../src/intellisense', () => ({ activateIntellisense: vi.fn() }));
vi.mock('../../src/watchers', () => ({ activateConfigWatchers: vi.fn(), filesWatcher: class FilesWatcher {} }));

beforeEach(async () => {
    vi.clearAllMocks();
    host.handlers.clear();
    host.selectProject.mockResolvedValue({ root: '/project' });
    await activateExtension({ subscriptions: [] } as unknown as ExtensionContext);
});

it('shows one project-scoped Nitro task palette entry and retains the Explorer action', () => {
    const { contributes } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    const palette = contributes.menus.commandPalette;
    const visible = contributes.commands.filter((command: any) => command.title === 'Create Nitro Task'
        && palette.find((menu: any) => menu.command === command.command)?.when !== 'false');
    expect(visible.map((command: any) => command.command)).toEqual(['nuxtr.createNitroTask']);
    expect(palette.find((menu: any) => menu.command === 'nuxtr.createNitroTask')?.when).toBe('nuxtr.isNuxtProject');
    expect(contributes.menus['explorer/context'].some((menu: any) => menu.command === 'nuxtr.directCreateNitroTask')).toBe(true);
});

it('uses the normal task flow when the Explorer command is invoked without a resource', async () => {
    await host.handlers.get('nuxtr.directCreateNitroTask')!();
    expect(host.error).not.toHaveBeenCalled();
    expect(host.createTask).toHaveBeenCalledWith();
    expect(host.directTask).not.toHaveBeenCalled();
});

it('preserves clicked task subfolders and selects their project', async () => {
    const resource = Uri.file('/project/server/tasks/db');
    await host.handlers.get('nuxtr.directCreateNitroTask')!(resource);
    expect(host.selectProject).toHaveBeenCalledWith(resource);
    expect(host.directTask).toHaveBeenCalledWith(resource.fsPath);
    expect(host.createTask).not.toHaveBeenCalled();
    expect(host.error).not.toHaveBeenCalled();
});

it('runs the public palette command without requiring an Explorer URI', async () => {
    await host.handlers.get('nuxtr.createNitroTask')!();
    expect(host.createTask).toHaveBeenCalledWith();
    expect(host.error).not.toHaveBeenCalled();
});
