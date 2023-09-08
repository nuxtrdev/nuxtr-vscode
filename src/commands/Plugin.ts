import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, hasServerDir } from '../utils'
import { nuxtPluginTemplate, nitroPluginTemplate } from '../templates/typeScriptFiles'

const createPlugin = () => {
    window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then((name) => {
            if (!name) {return}

            let pluginsDir = `${projectSrcDirectory()}/plugins`

            createDir('plugins')

            let subFolders = createSubFolders(pluginsDir, 'plugins')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'plugins',
                content: nuxtPluginTemplate
            })

        })
}


const directCreatePlugin = (path: string) => {
    const serverDir = hasServerDir()

    window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then((name) => {
            if (!name) {return}

            let filePath = `${path}/${name}.ts`


            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroPluginTemplate : nuxtPluginTemplate,
                fullPath: filePath,
            })
        })
}

export { createPlugin, directCreatePlugin }
