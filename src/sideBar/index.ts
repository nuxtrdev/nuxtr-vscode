/** Present the Vue sidebar and dispatch project dependency, module and template actions. */
import { sidebarHtml } from '../core/webview';
import { cachedCatalogue, fetchCatalogue } from '../services/catalogue';
import { CataloguePayload, moduleCompatible } from '../core/catalogue';
import { getNuxtVersion } from '../utils/nuxt';
import { openPackageReleaseNotes } from '../services/releases';
import { SidebarEvent, parseSidebarRequest } from '../core/messages';
import { ProjectContext } from '../core/project';
import { currentProject, withProject } from '../services/project';
import { managerCommand, terminalCommand } from '../core/managers';
import { choosePackageManager } from '../utils/dependency';
import { ModuleMetadata, canonicalPackageName, installThenConfigure, moduleIsDevelopment } from '../core/modules';
import { existsSync, readFileSync, readdirSync, unlinkSync } from 'node:fs'
import { capitalize } from 'string-ts'
import * as vscode from 'vscode'

import {
    detectPackageManagerByName,
    getInstallationCommand,
    getNonce,
    getOutdatedPackages,
    getProjectDependencies,
    getProjectScripts,
    getUri,
    managePackageVersion,
    newTerminal,
    openExternalLink,
    projectRootDirectory,
    removeNuxtModule,
    removePackage,
    runCommand,
    updateNuxtConfig
} from '../utils'

import commands from '../commands'


export class ModulesView implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView
    private listeners: vscode.Disposable[] = [];
    private project?: ProjectContext;
    private request = 0;
    private catalogue: CataloguePayload;
    private route: 'projectView' | 'modules' = 'projectView';
    private pendingAction?: 'addModule' | 'addLayer';
    private webviewReady = false;

    /** Keep the extension URI for packaged asset resolution. */
    constructor (private readonly _extensionUri: vscode.Uri, private readonly context: vscode.ExtensionContext) { this.catalogue = cachedCatalogue(context.globalState); }

    /** Initialize the webview and bind sidebar visibility and messages. */
    public resolveWebviewView (webviewView: vscode.WebviewView) {
        this.dispose();
        this._view = webviewView

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        }

        this._setWebviewMessageListener(webviewView.webview)
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

        this.listeners.push(webviewView.onDidChangeVisibility(() => {
            // Revealing the sidebar must preserve the page requested by its opening command.
            if (webviewView.visible && this.webviewReady) {
                this.refreshProjectData()
            }
        }), webviewView.onDidDispose(() => this.dispose()));
    }

    /** Dispose listeners whenever the sidebar is replaced or the extension shuts down. */
    public dispose () { for (const listener of this.listeners.splice(0)) { listener.dispose(); } this._view = undefined; this.webviewReady = false; }

    /** Refresh visible sidebar data without replacing the requested route or integration filter. */
    private refreshProjectData () {
        void this.getDependencies().catch(error => { vscode.window.showErrorMessage(String(error)); })
    }

    /** Send project package, template and update metadata to the sidebar. */
    public async getDependencies () {
        this.project = currentProject();
        const request = ++this.request;
        const dependencies = await getProjectDependencies()
        const scripts = getProjectScripts()

        const vscodeVersion = vscode.version
        const extension_version = existsSync(`${this._extensionUri.fsPath}/package.json`)
            ? JSON.parse(readFileSync(`${this._extensionUri.fsPath}/package.json`, 'utf8')).version
            : 'undefined'
        const feedbackContent = {
            vscode_version: vscodeVersion,
            extension_version,
            vscode_theme_id: vscode.workspace.getConfiguration().get('workbench.colorTheme'),
        }

        // regex find list of snippets inside .vscode folder
        const snippets = existsSync(`${projectRootDirectory()}/.vscode`)
            ? readdirSync(`${projectRootDirectory()}/.vscode`)
                .filter((file) => file.match(/.*\.code-snippets/))
            : []

        // regex find list of file templates inside .vscode folder
        const fileTemplates = existsSync(`${projectRootDirectory()}/.vscode`)
            ? readdirSync(`${projectRootDirectory()}/.vscode`)
                .filter((file) => file.match(/.*\.(page-template|layout-template|component-template|composable-template|api-template)/))
            : []

        if (request !== this.request) { return; }
        this.postMessage({
            command: 'projectViewData',
            data: {
                dependencies,
                scripts,
                feedbackContent,
                snippets,
                fileTemplates
            },
        })

        await this.refreshCatalogue();
        await this.updateModules();

        let outdatedDependencies: any;
        try { outdatedDependencies = await getOutdatedPackages(); } catch (error) {
            if (request === this.request) { this.postMessage({ command: 'outdatedDependencies', data: [] }); }
            throw error;
        }
        if (request !== this.request) { return; }

        outdatedDependencies = JSON.parse(outdatedDependencies)

        if (outdatedDependencies) {
            outdatedDependencies = Object.keys(outdatedDependencies).map((key) => {
                return {
                    current: outdatedDependencies[key].current,
                    latest: outdatedDependencies[key].latest,
                    wanted: outdatedDependencies[key].wanted,
                    dependent: outdatedDependencies[key].dependent,
                    name: key,
                }
            })

            await vscode.commands.executeCommand('nuxtr.globalState', { update: true, name: 'outdatedDependencies', value: outdatedDependencies })

            this.postMessage({
                command: 'outdatedDependencies',
                data: outdatedDependencies,
            })
        }
    }

    /** Execute a declared script with the selected manager, separating scripts from local CLI actions. */
    public async runAction (script: string) {
        if (!Object.hasOwn(getProjectScripts(), script)) { throw new Error('The selected script does not exist in this project.'); }
        const manager = await choosePackageManager();
        if (!manager) { return; }
        const command = managerCommand(manager, 'script', projectRootDirectory(), [script]);
        if (script.includes('build') || script.includes('generate')) {
            await runCommand({ command, message: `Nuxtr: ${script}`, successMessage: `${script} finished`, errorMessage: `${script} failed`, logger: true });
        } else { newTerminal(`Project: ${script}`, terminalCommand(command), command.cwd); }
    }

    /** Send the current project’s installed dependency list to the module view. */
    public async updateModules () {
        const installedModules = await getProjectDependencies()
        this.postMessage({
            command: 'installedModules',
            data: installedModules,
        })
    }

    /** Serve offline metadata immediately, refreshing through the host only when explicitly requested. */
    public async refreshCatalogue (force = false) {
        if (force) { this.catalogue = await fetchCatalogue(this.context.globalState, this.catalogue); }
        this.postMessage({ command: 'moduleCatalogue', data: { ...this.catalogue, projectVersion: getNuxtVersion() } });
    }

    /** Retain navigation until the webview is ready, then deliver events to its mounted page. */
    public postMessage (message: SidebarEvent) {
        if (message.command === 'projectView' || message.command === 'modules') {
            this.project = currentProject();
            this.route = message.command;
            this.pendingAction = undefined;
            this.sendNavigation();
            return;
        }
        if (message.command === 'addModule' || message.command === 'addLayer') {
            this.project = currentProject();
            this.route = 'modules';
            this.pendingAction = message.command;
            this.sendNavigation();
            return;
        }
        if (this._view && this.webviewReady) {
            this._view.webview.postMessage(message)
        }
    }

    /** Replay page and filter together, including when Vue mounts the destination page. */
    private sendNavigation () {
        if (!this._view || !this.webviewReady) { return; }
        this._view.webview.postMessage({ command: this.route });
        if (this.pendingAction) { this._view.webview.postMessage({ command: this.pendingAction }); }
    }

    /** Render the sidebar shell with local JS/CSS asset URIs. */
    private _getHtmlForWebview (webview: vscode.Webview) {
        const nonce = getNonce();
        const stylesUri = getUri(webview, this._extensionUri, ['out', 'sidebar', 'assets', 'index.css'])
        // The JS file from the Vue build output
        const scriptUri = getUri(webview, this._extensionUri, ['out', 'sidebar', 'assets', 'index.js'])

        return sidebarHtml({ css: String(stylesUri), js: String(scriptUri), source: webview.cspSource, nonce });
    }

    /** Install first, then edit configuration; report an installed package separately from a failed config edit. */
    private async installModule (module: ModuleMetadata) {
        const name = canonicalPackageName(module);
        const metadata = this.catalogue.modules.find(item => item.npm === name);
        if (metadata && !moduleCompatible(metadata, getNuxtVersion())) {
            const error = 'This module’s compatibility range does not include the selected Nuxt version. Choose a compatible module or update the project.';
            this.postMessage({ command: 'moduleInstalled', installed: false, configured: false, cmd: name, error });
            vscode.window.showErrorMessage(error);
            return;
        }
        module = metadata || module;
        const result = await installThenConfigure(
            async () => {
                const command = await getInstallationCommand(name, moduleIsDevelopment(module));
                return runCommand({ command, message: `Installing ${name}`, successMessage: `${name} installed`, errorMessage: `Failed to install ${name}`, logger: true });
            },
            () => updateNuxtConfig('add-module', name)
        );
        this.postMessage({ command: 'moduleInstalled', installed: result.installed, configured: result.configured, cmd: name, error: result.error ? String(result.error) : undefined });
        if (!result.installed) { return; }
        try { await this.updateModules(); }
        catch (error) { vscode.window.showErrorMessage(`${name} is installed, but refreshing the dependency list failed: ${String(error)}.`); }
        if (result.configured) { vscode.window.showInformationMessage(`${name} installed and configured.`); }
        else { vscode.window.showErrorMessage(`${name} is installed, but its Nuxt config edit failed: ${String(result.error)}. Add it manually to modules/extends.`); }
    }

    /** Upgrade a selected module through dependency management. */
    public async upgradeModule (module: any) {
        await managePackageVersion(module)
    }

    /** Remove a Nuxt module and its corresponding configuration entry. */
    public async removeModule (module: any) {
        // show confirmation message
        const confirmation = await vscode.window.showInformationMessage(
            `Are you sure you want to remove ${module}?`,
            'Yes',
            'No'
        )
        if (confirmation === 'Yes') {
            const name = canonicalPackageName(module);
            await removePackage(name);
            try { removeNuxtModule(name); } catch (error) { vscode.window.showErrorMessage(`${name} removed, but configuration cleanup failed: ${String(error)}`); }
            await this.updateModules();
        }
    }
    /** Open a project snippet file in the editor. */
    public editSnippet (snippet: string) {
        const snippetPath = `${projectRootDirectory()}/.vscode/${snippet}`
        if (existsSync(snippetPath)) {
            vscode.window.showTextDocument(vscode.Uri.file(snippetPath))
        } else {
            vscode.window.showErrorMessage(`Snippet ${snippet} not found`)
        }
    }

    /** Open a project template file in the editor. */
    public editTemplate (snippet: string) {
        const snippetPath = `${projectRootDirectory()}/.vscode/${snippet}`
        if (existsSync(snippetPath)) {
            vscode.window.showTextDocument(vscode.Uri.file(snippetPath))
        } else {
            vscode.window.showErrorMessage(`Snippet ${snippet} not found`)
        }
    }

    /** Confirm and remove an existing project template. */
    public async deleteTemplate (template: string) {
        //  create a confirmation message to delete the template
        const confirmation = await vscode.window.showInformationMessage(
            `Are you sure you want to delete ${template}?`,
            'Yes',
            'No'
        )
        if (confirmation === 'Yes') {
            const templatePath = `${projectRootDirectory()}/.vscode/${template}`
            if (existsSync(templatePath)) {
                unlinkSync(templatePath)
            } else {
                vscode.window.showErrorMessage(`Template ${template} not found`)
            }
        }

    }

    /** Confirm and remove an existing project snippet. */
    public async deleteSnippet (snippet: string) {
        //  create a confirmation message to delete the template
        const confirmation = await vscode.window.showInformationMessage(
            `Are you sure you want to delete ${snippet}?`,
            'Yes',
            'No'
        )
        if (confirmation === 'Yes') {
            const snippetPath = `${projectRootDirectory()}/.vscode/${snippet}`
            if (existsSync(snippetPath)) {
                unlinkSync(snippetPath)
            } else {
                vscode.window.showErrorMessage(`Snippet ${snippet} not found`)
            }
        }

    }

    /** Validate and await a sidebar action in the project that supplied the displayed data. */
    private _setWebviewMessageListener (webview: vscode.Webview) {
        this.listeners.push(webview.onDidReceiveMessage(async (raw: unknown) => {
            const message = parseSidebarRequest(raw);
            if (!message) { return; }
            try {
                if (message.command === 'openExternal') { await openExternalLink(message.url); return; }
                await withProject(this.project || currentProject(), async () => {
                    switch (message.command) {
                        case 'refreshCatalogue': { await this.refreshCatalogue(true); break; }
                        case 'ready': { this.webviewReady = true; this.sendNavigation(); await this.getDependencies(); break; }
                        case 'installModule': { await this.installModule(message.module); break; }
                        case 'openPackageReleaseNotes': { await openPackageReleaseNotes(message.name); break; }
                        case 'runAction': { await this.runAction(message.script); break; }
                        case 'upgradeModule': { await this.upgradeModule(message.module); break; }
                        case 'removeModule': { await this.removeModule(message.module); break; }
                        case 'editSnippet': { this.editSnippet(message.data); break; }
                        case 'deleteSnippet': { await this.deleteSnippet(message.data); break; }
                        case 'editTemplate': { this.editTemplate(message.data); break; }
                        case 'deleteTemplate': { await this.deleteTemplate(message.data); break; }
                        case 'configureNewSnippet': { await vscode.commands.executeCommand('workbench.action.openSnippets'); break; }
                        case 'createFileFromTemplate': { await vscode.commands.executeCommand('nuxtr.createFileFromTemplate', message.data); break; }
                        case 'createEmptyFileTemplate': { await vscode.commands.executeCommand('nuxtr.createEmptyFileTemplate'); break; }
                    }
                });
            } catch (error) {
                if (message.command === 'installModule') {
                    this.postMessage({ command: 'moduleInstalled', installed: false, configured: false, cmd: message.module.npm, error: String(error) });
                }
                vscode.window.showErrorMessage(String(error));
            }
        }));
    }
}
