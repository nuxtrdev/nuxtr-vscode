/** Register Nuxt project commands, sidebar, status indicators and owned project watchers. */
import { ExtensionContext, Uri, commands, window } from 'vscode';
import { activateTerminals } from './services/terminals';
import { activateSnippets } from './snippets';
import { wrapWithNuxtComponent } from './commands/wrapComponent';
import { projectHealthCheck } from './commands/projectHealth';
import { selectProject, withProject } from './services/project';
import nuxtrCommands from './commands'
import { ModulesView } from './sideBar'
import { logger, projectRootDirectory, updateDependencies } from './utils';
import codelens from './codelens'
import { activateStatusBarIcons, statusBars } from './statusBar'
import { activateIntellisense } from './intellisense'
import { activateConfigWatchers, filesWatcher } from './watchers';

const extensionCommands = [
    { command: 'nuxtr.wrapWithNuxtComponent', function: wrapWithNuxtComponent },
    { command: 'nuxtr.projectHealthCheck', function: projectHealthCheck },
    { command: 'nuxtr.createNitroTask', function: () => nuxtrCommands.createNitroTask() },
    // Keybindings and command history can invoke the Explorer action without a folder URI.
    { command: 'nuxtr.directCreateNitroTask', function: (resource?: Uri) => resource
        ? nuxtrCommands.directCreateNitroTask(resource.fsPath) : nuxtrCommands.createNitroTask() },
    { command: 'nuxtr.enableNitroTasks', function: nuxtrCommands.enableNitroTasks },
    { command: 'nuxtr.createPage', function: nuxtrCommands.createPage },
    { command: 'nuxtr.createComponent', function: nuxtrCommands.createComponent },
    { command: 'nuxtr.createComposable', function: nuxtrCommands.createComposable },
    { command: 'nuxtr.createLayout', function: nuxtrCommands.createLayout },
    { command: 'nuxtr.createPlugin', function: nuxtrCommands.createPlugin },
    { command: 'nuxtr.createMiddleware', function: nuxtrCommands.createMiddleware },
    { command: 'nuxtr.createNitroAPI', function: nuxtrCommands.createNitroAPI },
    { command: 'nuxtr.createNitroPlugin', function: nuxtrCommands.createNitroPlugin },
    { command: 'nuxtr.createNitroUtil', function: nuxtrCommands.createNitroUtil },
    { command: 'nuxtr.createNitroMiddleware', function: nuxtrCommands.createNitroMiddleware },
    { command: 'nuxtr.createNitroRoute', function: nuxtrCommands.createNitroRoute },
    { command: 'nuxtr.createStore', function: nuxtrCommands.createStore },
    { command: 'nuxtr.createUtil', function: nuxtrCommands.createUtil },
    { command: 'nuxtr.projectStructure', function: nuxtrCommands.projectStructure },
    { command: 'nuxtr.openDocumentation', function: nuxtrCommands.openDocumentation },
    { command: 'nuxtr.openModules', function: nuxtrCommands.openModules },
    { command: 'nuxtr.nuxtDev', function: nuxtrCommands.nuxtDev },
    { command: 'nuxtr.nuxtBuild', function: nuxtrCommands.nuxtBuild },
    { command: 'nuxtr.nuxtGenerate', function: nuxtrCommands.nuxtGenerate },
    { command: 'nuxtr.nuxtCleanUp', function: nuxtrCommands.nuxtCleanUp },
    { command: 'nuxtr.nuxtAnalyze', function: nuxtrCommands.nuxtAnalyze },
    { command: 'nuxtr.showCLICommands', function: nuxtrCommands.showCLICommands },
    { command: 'nuxtr.updateDependencies', function: updateDependencies },
    { command: 'nuxtr.nuxtInfo', function: nuxtrCommands.nuxtInfo },
    { command: 'nuxtr.appConfig', function: nuxtrCommands.appConfig },
    { command: 'nuxtr.nuxtIgnore', function: nuxtrCommands.nuxtIgnore },
    { command: 'nuxtr.nuxtRC', function: nuxtrCommands.nuxtRC },
    { command: 'nuxtr.errorLayout', function: nuxtrCommands.errorLayout },
    { command: 'nuxtr.installDependencies', function: nuxtrCommands.installDependencies },
    { command: 'nuxtr.openSettings', function: nuxtrCommands.openSettings },
    { command: 'nuxtr.configureCSS', function: nuxtrCommands.configureCSS },
    { command: 'nuxtr.configureLinters', function: nuxtrCommands.configureLinters },
    { command: 'nuxtr.configurePug', function: nuxtrCommands.configurePug },
    { command: 'nuxtr.createPageTemplate', function: nuxtrCommands.createPageTemplate },
    { command: 'nuxtr.createLayoutTemplate', function: nuxtrCommands.createLayoutTemplate },
    { command: 'nuxtr.createEmptyFileTemplate', function: nuxtrCommands.createEmptyFileTemplate },
    { command: 'nuxtr.nuxtModule', function: async () => await nuxtrCommands.nuxtModule() },
    { command: 'nuxtr.createFileFromTemplate', function: (template: string) => nuxtrCommands.createFileFromTemplate(template) },
    { command: 'nuxtr.directUpgradeNuxt', function: async () => await nuxtrCommands.upgradePackage('nuxt') },
    { command: 'nuxtr.managePackageVersion', function: async () => await nuxtrCommands.managePackageVersion('nuxt') },
    { command: 'nuxtr.directCreatePage', function: async (filePath: Uri) => await nuxtrCommands.directCreatePage(filePath.fsPath) },
    { command: 'nuxtr.directCreateComponent', function: async (filePath: Uri) => await nuxtrCommands.directCreateComponent(filePath.fsPath) },
    { command: 'nuxtr.directCreateComposable', function: (filePath: Uri) => nuxtrCommands.directCreateComposable(filePath.fsPath) },
    { command: 'nuxtr.directCreateLayout', function: (filePath: Uri) => nuxtrCommands.directCreateLayout(filePath.fsPath) },
    { command: 'nuxtr.directCreatePlugin', function: (filePath: Uri) => nuxtrCommands.directCreatePlugin(filePath.fsPath) },
    { command: 'nuxtr.directCreateMiddleware', function: (filePath: Uri) => nuxtrCommands.directCreateMiddleware(filePath.fsPath) },
    { command: 'nuxtr.directCreateNitroAPI', function: (filePath: Uri) => nuxtrCommands.directCreateNitroAPI(filePath.fsPath) },
    { command: 'nuxtr.directCreateNitroRoute', function: (filePath: Uri) => nuxtrCommands.directCreateNitroRoute(filePath.fsPath) },
    { command: 'nuxtr.directCreateStore', function: (filePath: Uri) => nuxtrCommands.directCreateStore(filePath.fsPath) },
    { command: 'nuxtr.directCreateUtil', function: (filePath: Uri) => nuxtrCommands.directCreateUtil(filePath.fsPath) },
];

export const publicCommands = [
    { command: 'nuxtr.createProject', function: async () => await nuxtrCommands.createProject() },
];


/** Activate project services once; all registrations are owned by the extension context. */
export async function activateExtension (context: ExtensionContext) {
    // initial output channel logger
    context.subscriptions.push(logger);
    logger.log('Nuxtr is active')
    await activateSnippets(context);
    activateTerminals(context);

    // global state command
    context.subscriptions.push(commands.registerCommand('nuxtr.globalState', ({ update, name, value }) => {
        if (update) {
            return context.globalState.update(name === 'outdatedDependencies' ? name + ':' + projectRootDirectory() : name, value)

        } else {
            return context.globalState.get(name === 'outdatedDependencies' ? name + ':' + projectRootDirectory() : name)
        }
    }))


    const sidebarProvider = new ModulesView(context.extensionUri, context)
    context.subscriptions.push(sidebarProvider);


    activateConfigWatchers(context);

    // Initialize file watchers
    new filesWatcher(sidebarProvider, context, statusBars.updatesStatusBar)

    // activate status bar icons
    activateStatusBarIcons(context)

    // activate intellisense
    activateIntellisense(context)

    // activate codelens
    codelens.activateCodelenses(context)

    for (const { command, function: commandFunction } of extensionCommands) {
        context.subscriptions.push(commands.registerCommand(command, async (...args: any[]) => {
            try {
                const project = await selectProject(args.find(arg => arg instanceof Uri));
                if (!project) { return; }
                return await withProject(project, () => (commandFunction as (...args: any[]) => any)(...args));
            } catch (error) { window.showErrorMessage(String(error)); }
        }));
    }


    context.subscriptions.push(commands.registerCommand('nuxtr.refreshModules', async () => { await sidebarProvider.refreshCatalogue(true); await sidebarProvider.updateModules(); }))

    context.subscriptions.push(window.registerWebviewViewProvider('nuxtrSidebar', sidebarProvider))


    // sidebarProjectView
    context.subscriptions.push(
        commands.registerCommand('nuxtr.sidebarProjectView', () => {
            sidebarProvider.postMessage({ command: 'projectView' })
            sidebarProvider.getDependencies()
        })
    )

    // Navigation state is retained until the webview's ready handshake arrives.
    context.subscriptions.push(commands.registerCommand('nuxtr.sidebarModulesView', async () => {
        sidebarProvider.postMessage({ command: 'modules' });
        await commands.executeCommand('workbench.view.extension.sidebar-view');
        await sidebarProvider.updateModules();
    }));
    for (const [command, action] of [['nuxtr.createModuleAction', 'addModule'], ['nuxtr.createLayer', 'addLayer']] as const) {
        context.subscriptions.push(commands.registerCommand(command, async (resource?: Uri) => {
            const project = await selectProject(resource);
            if (!project) { return; }
            await withProject(project, async () => {
                sidebarProvider.postMessage({ command: action });
                await commands.executeCommand('workbench.view.extension.sidebar-view');
                await sidebarProvider.updateModules();
            });
        }));
    }
}
