import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir } from '../utils'
import { pluginTemplate } from '../templates/typeScriptFiles'

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
                content: pluginTemplate
            })

        })
}


const directCreatePlugin = (path: string) => {
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
                content: pluginTemplate,
                fullPath: filePath,
            })
        })
}

export { createPlugin, directCreatePlugin }
