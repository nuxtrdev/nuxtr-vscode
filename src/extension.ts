import { window, ExtensionContext, commands, Uri } from 'vscode';
import nuxtrCommands from './commands'
import { ModulesView } from './sideBar'
import { logger, updateDependencies } from './utils';
import codelens from './codelens'
import { statusBars, activateStatusBarIcons } from './statusBar'
import { activateIntellisense } from './intellisense'
import { filesWatcher } from './watchers'
import { main, runCommand, runMain } from './nuxtCLI';

const commandList = [
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
    { command: 'nuxtr.nuxtBuildModule', function: nuxtrCommands.nuxtBuildModule },
    { command: 'nuxtr.updateDependencies', function: updateDependencies },
    { command: 'nuxtr.nuxtInfo', function: nuxtrCommands.nuxtInfo },
    { command: 'nuxtr.appConfig', function: nuxtrCommands.appConfig },
    { command: 'nuxtr.nuxtIgnore', function: nuxtrCommands.nuxtIgnore },
    { command: 'nuxtr.nuxtRC', function: nuxtrCommands.nuxtRC },
    { command: 'nuxtr.installDependencies', function: nuxtrCommands.installDependencies },
    { command: 'nuxtr.openSettings', function: nuxtrCommands.openSettings },
    { command: 'nuxtr.configureCSS', function: nuxtrCommands.configureCSS },
    { command: 'nuxtr.configureLinters', function: nuxtrCommands.configureLinters },
    { command: 'nuxtr.configurePug', function: nuxtrCommands.configurePug },
    { command: 'nuxtr.createPageTemplate', function: nuxtrCommands.createPageTemplate },
    { command: 'nuxtr.createLayoutTemplate', function: nuxtrCommands.createLayoutTemplate },
    { command: 'nuxtr.createEmptyFileTemplate', function: nuxtrCommands.createEmptyFileTemplate },
    { command: 'nuxtr.createFileFromTemplate', function: (template: string) => nuxtrCommands.createFileFromTemplate(template) },
    { command: 'nuxtr.directUpgradeNuxt', function: async () => await nuxtrCommands.upgradePackage('nuxt') },
    { command: 'nuxtr.managePackageVersion', function: async () => await nuxtrCommands.managePackageVersion('nuxt') },
    { command: 'nuxtr.directCreatePage', function: async (filePath: Uri) => await nuxtrCommands.directCreatePage(filePath.path) },
    { command: 'nuxtr.directCreateComponent', function: async (filePath: Uri) => await nuxtrCommands.directCreateComponent(filePath.path) },
    { command: 'nuxtr.directCreateComposable', function: (filePath: Uri) => nuxtrCommands.directCreateComposable(filePath.path) },
    { command: 'nuxtr.directCreateLayout', function: (filePath: Uri) => nuxtrCommands.directCreateLayout(filePath.path) },
    { command: 'nuxtr.directCreatePlugin', function: (filePath: Uri) => nuxtrCommands.directCreatePlugin(filePath.path) },
    { command: 'nuxtr.directCreateMiddleware', function: (filePath: Uri) => nuxtrCommands.directCreateMiddleware(filePath.path) },
    { command: 'nuxtr.directCreateNitroAPI', function: (filePath: Uri) => nuxtrCommands.directCreateNitroAPI(filePath.path) },
    { command: 'nuxtr.directCreateNitroRoute', function: (filePath: Uri) => nuxtrCommands.directCreateNitroRoute(filePath.path) },
    { command: 'nuxtr.directCreateStore', function: (filePath: Uri) => nuxtrCommands.directCreateStore(filePath.path) },
    { command: 'nuxtr.directCreateUtil', function: (filePath: Uri) => nuxtrCommands.directCreateUtil(filePath.path) },
];

// categorize commands and functions
export async function activateExtension(context: ExtensionContext) {
    // initial output channel logger
    logger.log('Nuxtr is active')

    const sidebarProvider = new ModulesView(context.extensionUri)


    // Initialize file watchers
    new filesWatcher(sidebarProvider, context, statusBars.updatesStatusBar)

    // activate status bar icons
    activateStatusBarIcons(context)

    // activate intellisense
    activateIntellisense(context)

    // activate codelens
    codelens.activateCodelenses(context)

    // global state command
    context.subscriptions.push(commands.registerCommand('nuxtr.globalState', ({ update, name, value }) => {
        if (update) {
            context.globalState.update(name, value)
            return
        } else {
            return context.globalState.get(name)
        }
    }))


    commandList.forEach(({ command, function: commandFunction }) => {
        context.subscriptions.push(commands.registerCommand(command, commandFunction));
    });

    context.subscriptions.push(commands.registerCommand('nuxtr.refreshModules', () => sidebarProvider.updateModules()))

    context.subscriptions.push(window.registerWebviewViewProvider('nuxtrSidebar', sidebarProvider))


    // sidebarProjectView
    context.subscriptions.push(
        commands.registerCommand('nuxtr.sidebarProjectView', () => {
            sidebarProvider.postMessage({ command: 'projectView' })
            sidebarProvider.getDependencies()
        })
    )

    // nuxtr.sidebarModulesView
    context.subscriptions.push(
        commands.registerCommand('nuxtr.sidebarModulesView', async () => {
            await commands.executeCommand('workbench.view.extension.sidebar-view').then(() => {
                setTimeout(() => {
                    sidebarProvider.postMessage({ command: 'modules' })
                    sidebarProvider.updateModules()
                }, 50)
            })
        })
    )

    // nuxtr.addModule command for codelens action
    context.subscriptions.push(
        commands.registerCommand('nuxtr.createModuleAction', async () => {
            await commands.executeCommand('nuxtr.sidebarModulesView').then(() => {
                setTimeout(() => {
                    sidebarProvider.postMessage({ command: 'addModule' })
                }, 50)
            })
        })
    )

    // nuxtr.createLayer command for codelens action
    context.subscriptions.push(
        commands.registerCommand('nuxtr.createLayer', async () => {
            await commands.executeCommand('nuxtr.sidebarModulesView').then(() => {
                setTimeout(() => {
                    sidebarProvider.postMessage({ command: 'addLayer' })
                }, 50)
            })
        })
    )
}
