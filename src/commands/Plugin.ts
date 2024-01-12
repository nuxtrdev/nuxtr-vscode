import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, hasServerDir, normalizeFileExtension } from '../utils'
import { nuxtPluginTemplate, nitroPluginTemplate } from '../templates'

const createPlugin = () => {
    window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then(async (name) => {
            if (!name) { return }

            let pluginsDir = `${await projectSrcDirectory()}/plugins`

            await createDir('plugins')

            let subFolders = await createSubFolders(pluginsDir, 'plugins')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'plugins',
                content: nuxtPluginTemplate
            })

        })
}


const directCreatePlugin = async (path: string) => {
    const serverDir = await hasServerDir()

    window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then((name) => {
            if (!name) { return }

            let filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`


            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroPluginTemplate : nuxtPluginTemplate,
                fullPath: filePath,
            })
        })
}

export { createPlugin, directCreatePlugin }
