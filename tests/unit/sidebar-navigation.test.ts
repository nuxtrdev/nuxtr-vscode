/** Reproduce cold sidebar navigation, delayed visibility callbacks and recreated webview handshakes. */
import { beforeEach, expect, it, vi } from 'vitest';
import { type ExtensionContext, Uri, type WebviewView } from 'vscode';
import { ModulesView } from '../../src/sideBar';
import { activateExtension } from '../../src/extension';

const host = vi.hoisted(() => ({
    handlers: new Map<string, (...args: any[]) => any>(), reveal: vi.fn(), selectProject: vi.fn(), provider: undefined as any,
}));
vi.mock('vscode', () => ({
    Uri: class Uri {
        /** Represent a config CodeLens resource supplied by VS Code. */
        constructor (public fsPath: string) {}
        /** Create a resource for project selection assertions. */
        static file (path: string) { return new this(path); }
    },
    commands: {
        registerCommand: (name: string, callback: (...args: any[]) => any) => { host.handlers.set(name, callback); return { dispose: vi.fn() }; },
        executeCommand: (name: string, ...args: any[]) => name === 'workbench.view.extension.sidebar-view' ? host.reveal() : host.handlers.get(name)?.(...args),
    },
    window: { showErrorMessage: vi.fn(), registerWebviewViewProvider: (_name: string, provider: unknown) => { host.provider = provider; return { dispose: vi.fn() }; } },
}));
vi.mock('../../src/services/catalogue', () => ({ cachedCatalogue: () => ({ modules: [] }), fetchCatalogue: vi.fn() }));
vi.mock('../../src/services/releases', () => ({ openPackageReleaseNotes: vi.fn() }));
vi.mock('../../src/services/project', () => ({ currentProject: () => ({ root: '/project' }), selectProject: host.selectProject, withProject: (_project: unknown, action: () => any) => action() }));
vi.mock('../../src/utils/nuxt', () => ({ getNuxtVersion: () => '4.6.1' }));
vi.mock('../../src/utils/dependency', () => ({ choosePackageManager: vi.fn() }));
vi.mock('../../src/utils', () => ({ getNonce: () => 'testNonce', getUri: () => '/assets/test', logger: { log: vi.fn() }, updateDependencies: vi.fn() }));
vi.mock('../../src/services/terminals', () => ({ activateTerminals: vi.fn() }));
vi.mock('../../src/commands/wrapComponent', () => ({ wrapWithNuxtComponent: vi.fn() }));
vi.mock('../../src/commands/projectHealth', () => ({ projectHealthCheck: vi.fn() }));
vi.mock('../../src/commands', () => ({ default: {} }));
vi.mock('../../src/snippets', () => ({ activateSnippets: vi.fn() }));
vi.mock('../../src/codelens', () => ({ default: { activateCodelenses: vi.fn() } }));
vi.mock('../../src/statusBar', () => ({ activateStatusBarIcons: vi.fn(), statusBars: {} }));
vi.mock('../../src/intellisense', () => ({ activateIntellisense: vi.fn() }));
vi.mock('../../src/watchers', () => ({ activateConfigWatchers: vi.fn(), filesWatcher: class FilesWatcher {} }));

let sidebar: ModulesView;
beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    host.handlers.clear();
    host.selectProject.mockResolvedValue({ root: '/project' });
    sidebar = new ModulesView({ fsPath: '/extension' } as Uri, { globalState: {} } as ExtensionContext);
    vi.spyOn(sidebar, 'getDependencies').mockResolvedValue(undefined);
});

/** Provide actual provider callbacks with controlled visibility and webview readiness. */
function fixtureView () {
    let receive: (message: unknown) => Promise<void>;
    let visibility: () => void;
    let dispose: () => void;
    const send = vi.fn().mockResolvedValue(true);
    const view = {
        visible: true,
        webview: {
            postMessage: send, cspSource: 'test-source',
            onDidReceiveMessage: (callback: typeof receive) => { receive = callback; return { dispose: vi.fn() }; },
        },
        onDidChangeVisibility: (callback: typeof visibility) => { visibility = callback; return { dispose: vi.fn() }; },
        onDidDispose: (callback: typeof dispose) => { dispose = callback; return { dispose: vi.fn() }; },
    } as unknown as WebviewView;
    return { view, send, ready: () => receive({ command: 'ready' }), visible: () => visibility(), dispose: () => dispose() };
}

it('retains a Modules request made before the sidebar exists until its ready handshake', async () => {
    sidebar.postMessage({ command: 'modules' });
    const fixture = fixtureView();
    sidebar.resolveWebviewView(fixture.view);
    expect(fixture.send).not.toHaveBeenCalled();
    await fixture.ready();
    expect(fixture.send).toHaveBeenCalledWith({ command: 'modules' });
    expect(fixture.send).not.toHaveBeenCalledWith({ command: 'projectView' });
});

it.each(['addModule', 'addLayer'] as const)('replays %s and opens Modules on the first cold-sidebar request', async command => {
    sidebar.postMessage({ command });
    const fixture = fixtureView();
    sidebar.resolveWebviewView(fixture.view);
    await fixture.ready();
    expect(fixture.send.mock.calls.map(([message]) => message)).toEqual([{ command: 'modules' }, { command }]);
});

it('does not let a late visibility callback overwrite requested module navigation', async () => {
    const fixture = fixtureView();
    sidebar.resolveWebviewView(fixture.view);
    await fixture.ready();
    sidebar.postMessage({ command: 'modules' });
    sidebar.postMessage({ command: 'addModule' });
    fixture.send.mockClear();
    fixture.visible();
    await fixture.ready();
    expect(fixture.send.mock.calls.map(([message]) => message)).toEqual([{ command: 'modules' }, { command: 'addModule' }]);
});

it('waits for readiness when a disposed webview is recreated without losing layer navigation', async () => {
    const first = fixtureView();
    sidebar.resolveWebviewView(first.view);
    await first.ready();
    sidebar.postMessage({ command: 'addLayer' });
    first.dispose();
    const next = fixtureView();
    sidebar.resolveWebviewView(next.view);
    sidebar.postMessage({ command: 'addLayer' });
    expect(next.send).not.toHaveBeenCalled();
    await next.ready();
    expect(next.send.mock.calls.map(([message]) => message)).toEqual([{ command: 'modules' }, { command: 'addLayer' }]);
});

it('honors explicit Project navigation and clears a previous integration filter request', async () => {
    sidebar.postMessage({ command: 'addLayer' });
    sidebar.postMessage({ command: 'projectView' });
    const fixture = fixtureView();
    sidebar.resolveWebviewView(fixture.view);
    await fixture.ready();
    expect(fixture.send.mock.calls.map(([message]) => message)).toEqual([{ command: 'projectView' }]);
    expect(sidebar.getDependencies).toHaveBeenCalled();
});

it.each([
    ['nuxtr.createModuleAction', 'addModule'],
    ['nuxtr.createLayer', 'addLayer'],
    ['nuxtr.sidebarModulesView', undefined],
] as const)('records navigation before %s reveals a cold sidebar', async (command, action) => {
    vi.spyOn(ModulesView.prototype, 'getDependencies').mockResolvedValue(undefined);
    vi.spyOn(ModulesView.prototype, 'updateModules').mockResolvedValue(undefined);
    await activateExtension({ extensionUri: Uri.file('/extension'), globalState: {}, subscriptions: [] } as unknown as ExtensionContext);
    const fixture = fixtureView();
    host.reveal.mockImplementation(async () => {
        host.provider.resolveWebviewView(fixture.view);
        await fixture.ready();
    });
    const config = Uri.file('/project/nuxt.config.ts');
    await host.handlers.get(command)!(config);
    expect(fixture.send.mock.calls.map(([message]) => message)).toEqual([
        { command: 'modules' }, ...(action ? [{ command: action }] : []),
    ]);
    expect(host.reveal).toHaveBeenCalledTimes(1);
    if (action) { expect(host.selectProject).toHaveBeenCalledWith(config); }
});
