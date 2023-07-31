import { workspace, ExtensionContext, commands, window } from 'vscode'
import { existsSync, promises as fs } from 'fs'
import { join } from 'path'
import { isNuxtProject } from './utils'
import { activateExtension } from './extension'

export async function activate(context: ExtensionContext) {

    let userRoot: string | undefined

    const configuration = workspace.getConfiguration('nuxtr').monorepoMode.DirectoryName

    if (!configuration) {
        userRoot = workspace.workspaceFolders?.[0]?.uri.fsPath
    } else {
        userRoot = workspace.workspaceFolders?.[0]?.uri.fsPath + `/` + configuration
    }

    if (!userRoot && !existsSync(`${userRoot}/package.json`))
    {return}

    const nuxtConfigPathTS = join(`${userRoot}/`, 'nuxt.config.ts')
    const nuxtConfigPathJS = join(`${userRoot}/`, 'nuxt.config.js')

    const nuxtConfigExistsTS = await fs.access(nuxtConfigPathTS).then(() => true).catch(() => false)
    const nuxtConfigExistsJS = await fs.access(nuxtConfigPathJS).then(() => true).catch(() => false)

    if (!nuxtConfigExistsTS && !nuxtConfigExistsJS) {return}


    const nuxtProject = await isNuxtProject()

    if (nuxtProject) {
        commands.executeCommand('setContext', 'nuxtr.isNuxtProject', nuxtProject)
        activateExtension(context)

    } else {
        commands.executeCommand('setContext', 'nuxtr.isNuxtProject', nuxtProject)
        window.showInformationMessage('Nuxtr: Not a Nuxt project')
    }
}

export async function deactivate() {
}