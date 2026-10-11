/** Refresh project views with owned watchers across nested and multiple workspace projects. */
import { ExtensionContext, StatusBarItem, workspace } from 'vscode';
import { nuxtConfigWatcher } from '../commands/devtools';
import { dependenciesUpdatesHandler } from '../utils';
import { currentProject, onProjectSelected, withProject } from '../services/project';
import type { ProjectContext } from '../core/project';
import type { ModulesView } from '../sideBar';

export default class FileWatchers {
    /** Watch all workspace projects and keep each asynchronous refresh inside its originating project. */
    constructor (sidebar: ModulesView, context: ExtensionContext, status: StatusBarItem) {
        /** Refresh the selected project after its manifest/templates or selection changes. */
        const refresh = async (project: ProjectContext) => {
            await withProject(project, async () => {
                try { await sidebar.getDependencies(); await dependenciesUpdatesHandler(status); }
                catch { status.text = '$(warning)'; }
            });
        };
        const config = workspace.createFileSystemWatcher('**/{nuxt.config.{ts,js,mjs,cjs},.config/nuxt.ts}');
        const packages = workspace.createFileSystemWatcher('**/package.json');
        const templates = workspace.createFileSystemWatcher('**/.vscode/*');
        /** Ignore generated/dependency files and unrelated projects while refreshing the displayed context. */
        const changed = (resource: import('vscode').Uri, configuration = false) => {
            if (/[\\/](?:node_modules|\.nuxt|\.output|\.git)[\\/]/.test(resource.fsPath)) { return; }
            try {
                const project = currentProject(resource);
                if (project.root !== currentProject().root) { return; }
                if (configuration) { void withProject(project, () => nuxtConfigWatcher()).catch(() => { status.text = '$(warning)'; }); }
                else { void refresh(project); }
            } catch { /* Resources outside known projects do not affect this sidebar. */ }
        };
        context.subscriptions.push(config, packages, templates, onProjectSelected(refresh),
            config.onDidChange(uri => changed(uri, true)),
            packages.onDidChange(uri => changed(uri)), packages.onDidCreate(uri => changed(uri)), packages.onDidDelete(uri => changed(uri)),
            templates.onDidChange(uri => changed(uri)), templates.onDidCreate(uri => changed(uri)), templates.onDidDelete(uri => changed(uri)));
    }
}
