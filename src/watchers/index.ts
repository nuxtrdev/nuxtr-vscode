import { ExtensionContext, StatusBarItem, Uri, workspace, commands } from 'vscode'
import { projectRootDirectory, updateNuxtConfig, findNuxtConfig } from './../utils'
import { nuxtConfigWatcher } from './../commands/Devtools';
class FileWatchers {

    public sidebarProvider: any
    public statusBar: StatusBarItem

    constructor(sidebarProvider: any, context: ExtensionContext, statusBar: StatusBarItem) {
        this.sidebarProvider = sidebarProvider
        this.statusBar = statusBar
    }

    public nuxtConfigFileWatcher = workspace
        .createFileSystemWatcher(findNuxtConfig() as string)
        .onDidChange(() => {
            nuxtConfigWatcher()
        })

    public packageJsonFileWatcher = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/package.json`)
        .onDidCreate(async (uri: Uri) => {
            this.sidebarProvider.updateModules()
            await this.sidebarProvider.getDependencies()

            const outdatedDependencies: any = await commands.executeCommand('nuxtr.globalState', { name: 'outdatedDependencies' })

            this.statusBar.text = `$(nuxtr-npm) ${outdatedDependencies.length}`

            if (outdatedDependencies.length === 0) {
                this.statusBar.color = undefined
                this.statusBar.command = undefined
            } else {
                this.statusBar.command = 'nuxtr.updateDependencies'
            }
        })

    public packageJsonFileChangedWatcher = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/package.json`)
        .onDidChange(async (uri: Uri) => {
            this.sidebarProvider.updateModules()
            await this.sidebarProvider.getDependencies()

            const outdatedDependencies: any = await commands.executeCommand('nuxtr.globalState', { name: 'outdatedDependencies' })

            this.statusBar.text = `$(nuxtr-npm) ${outdatedDependencies.length}`

            if (outdatedDependencies.length === 0) {
                this.statusBar.color = undefined
                this.statusBar.command = undefined
            } else {
                this.statusBar.command = 'nuxtr.updateDependencies'

            }
        })

    public dotvscodeFileWatcher = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/.vscode/**/*`)
        .onDidCreate((uri: Uri) => {
            this.sidebarProvider.getDependencies()
        })

    public dotvscodeFileWatcherOnDelete = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/.vscode/**/*`)
        .onDidDelete((uri: Uri) => {
            this.sidebarProvider.getDependencies()
        })


    public pluginsFileWatcher = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/plugins/**/*`)
        .onDidCreate(async (uri: Uri) => {
            const pluginsFiles = await workspace.findFiles('plugins/**/*').then((files) => {
                return files.map((file: any) => {
                    return file.path.replace(`${projectRootDirectory()}/`, '~/')
                })
            })
            updateNuxtConfig((config) => config.plugins = pluginsFiles)
        })

    public pluginsFileWatcherDeleted = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/plugins/**/*`)
        .onDidDelete(async (uri: Uri) => {

            const pluginsFiles = await workspace.findFiles('plugins/**/*').then((files) => {
                return files.map((file: any) => {
                    return file.path.replace(`${projectRootDirectory()}/`, '~/')
                })
            })

            updateNuxtConfig((config) => config.plugins = pluginsFiles)
        })

}

export default FileWatchers