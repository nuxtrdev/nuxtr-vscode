import { ExtensionContext, StatusBarItem, commands, workspace } from 'vscode'
import { findNuxtConfig, projectRootDirectory } from '../utils';
import { nuxtConfigWatcher } from '../commands/Devtools';
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
        .onDidCreate(async () => {
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
        .onDidChange(async () => {
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
        .onDidCreate(() => {
            this.sidebarProvider.getDependencies()
        })

    public dotvscodeFileWatcherOnDelete = workspace
        .createFileSystemWatcher(`${projectRootDirectory()}/.vscode/**/*`)
        .onDidDelete(() => {
            this.sidebarProvider.getDependencies()
        })

}

export default FileWatchers