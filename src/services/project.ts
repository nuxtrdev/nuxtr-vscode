/** Bridge pure project discovery to VS Code resource selection, settings and workspace lifecycle. */
import { AsyncLocalStorage } from 'node:async_hooks';
import { resolve } from 'node:path';
import { EventEmitter, ExtensionContext, Uri, commands, window, workspace } from 'vscode';
import { ProjectContext, configAt, containsPath, discoverProjects, managerRoot, projectForResource } from '../core/project';
import { explorerFolders } from '../core/explorer';

const operation = new AsyncLocalStorage<ProjectContext>();
let projects: ProjectContext[] = [];
const selectedProjectChanged = new EventEmitter<ProjectContext>();
export const onProjectSelected = selectedProjectChanged.event;
let selected: ProjectContext | undefined;

/** Honor the existing monorepo directory setting within the resource's workspace folder. */
function configuredProject (resource?: Uri): ProjectContext | undefined {
    const folder = (resource && workspace.getWorkspaceFolder(resource)) || workspace.workspaceFolders?.[0];
    if (!folder) { return; }
    const directory = workspace.getConfiguration('nuxtr', folder.uri).get<string>('monorepoMode.DirectoryName');
    if (!directory) { return; }
    const root = resolve(folder.uri.fsPath, directory);
    const configPath = configAt(root);
    if (!configPath) { throw new Error(`The configured monorepo directory has no Nuxt config: ${root}. Update nuxtr.monorepoMode.DirectoryName.`); }
    return { root, configPath, workspaceRoot: folder.uri.fsPath, packageManagerRoot: managerRoot(root, folder.uri.fsPath) };
}

/** Return the resource's project, or the current sidebar preview; commands must call selectProject first. */
export function currentProject (resource?: Uri): ProjectContext {
    if (!resource && operation.getStore()) { return operation.getStore()!; }
    const document = resource || window.activeTextEditor?.document.uri;
    const owned = configuredProject(document) || projectForResource(projects, document?.fsPath);
    if (resource && resource.scheme !== 'untitled' && !owned) { throw new Error('This resource is outside the discovered Nuxt projects.'); }
    const result = owned || selected || projects[0];
    if (!result) { throw new Error('No Nuxt project found. Open a Nuxt folder or run Nuxtr: Create Project.'); }
    return result;
}

/** Choose a command project explicitly when resource, active document and existing selection cannot resolve it. */
export async function selectProject (resource?: Uri | string, forcePicker = false): Promise<ProjectContext | undefined> {
    if (!forcePicker && !resource && operation.getStore()) { return operation.getStore(); }
    const uri = typeof resource === 'string' ? Uri.file(resource) : resource;
    const document = uri || window.activeTextEditor?.document.uri;
    let result = configuredProject(document);
    const candidates = uri ? projects.filter(project => containsPath(project.root, uri.fsPath) || containsPath(uri.fsPath, project.root)) : projects;
    if (uri && !result && candidates.length === 0) { throw new Error('This resource is outside the discovered Nuxt projects. Select a project or use a folder inside it.'); }
    if (!result && !forcePicker) {
        result = projectForResource(candidates, document?.fsPath) || (uri ? undefined : selected) || (candidates.length === 1 ? candidates[0] : undefined);
    }
    if (!result && candidates.length > 0) {
        const item = await window.showQuickPick(candidates.map(project => ({ label: workspace.asRelativePath(project.root), description: project.root, project })), { placeHolder: 'Select the Nuxt project for this action' });
        result = item?.project;
    }
    if (result) {
        const changed = selected?.root !== result.root;
        selected = result;
        if (changed) { selectedProjectChanged.fire(result); }
        await commands.executeCommand('setContext', 'nuxtr.selectedProject', result.root);
    }
    return result;
}

/** Refresh discovery when folders/configs change and activate project services after the first project appears. */
export async function initializeProjects (context: ExtensionContext, onProjects: (available: boolean) => Promise<void>) {
    /** Rescan configured workspaces and discard selections whose config has disappeared. */
    const refresh = async () => {
        projects = discoverProjects((workspace.workspaceFolders || []).map(folder => folder.uri.fsPath));
        if (selected && !projects.some(project => project.root === selected?.root)) { selected = undefined; }
        await onProjects(projects.length > 0);
        await updateExplorerFolders();
    };
    context.subscriptions.push(selectedProjectChanged, commands.registerCommand('nuxtr.selectProject', async (resource?: Uri | string) => {
        await refresh();
        return selectProject(resource, resource === undefined);
    }), workspace.onDidChangeWorkspaceFolders(refresh), workspace.onDidCreateFiles(refresh),
    workspace.onDidDeleteFiles(refresh), workspace.onDidRenameFiles(refresh));
    const watcher = workspace.createFileSystemWatcher('**/{nuxt.config.ts,nuxt.config.js,nuxt.config.mjs,nuxt.config.cjs,.config/nuxt.ts}');
    context.subscriptions.push(watcher, watcher.onDidCreate(refresh), watcher.onDidDelete(refresh), watcher.onDidChange(refresh));
    await refresh();
}

/** Publish resolved folders for all projects, refreshing custom-layout menu visibility after Explorer/config changes. */
async function updateExplorerFolders () {
    // Keep empty-window startup independent of workspace-only helpers.
    const helpers = projects.length > 0 ? await import('../utils/nuxt') : undefined;
    const folders = explorerFolders(projects, project => {
        if (!helpers) { throw new Error('No project layout is available.'); }
        return withProject(project, helpers.projectDirectories);
    });
    for (const [key, paths] of Object.entries(folders) as [string, string[]][]) {
        // VS Code uses fsPath for local resources and URI paths for remote resources.
        const resources = paths.map(path => {
            const owner = workspace.getWorkspaceFolder(Uri.file(path))
                || workspace.workspaceFolders?.find(folder => containsPath(folder.uri.fsPath, path));
            return owner && owner.uri.scheme !== 'file' ? Uri.file(path).path : path;
        });
        await commands.executeCommand('setContext', 'nuxtr.' + key, resources);
    }
}

/** Keep an explorer command's chosen project stable across prompts, awaits and concurrent commands. */
export function withProject<T> (project: ProjectContext, callback: () => T): T {
    return operation.run(project, callback);
}

/** Scope extension settings to the project selected for this operation, with an empty-window fallback. */
export function projectSettingsResource (): Uri | undefined {
    try { return Uri.file(currentProject().root); } catch { return window.activeTextEditor?.document.uri; }
}
