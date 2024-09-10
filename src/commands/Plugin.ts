import { window } from 'vscode'
import { createDir, createFile, createSubFolders, hasServerDir, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick, nuxtrConfiguration } from '../utils'
import { nitroPluginTemplate, nuxtPluginTemplate } from '../templates'

const nuxtLang = nuxtrConfiguration().nuxtFiles.defaultLanguage

const createPlugin = () => {
    window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then(async (name) => {
            if (!name) { return }

            const pluginsDir = `${await projectSrcDirectory()}/plugins`

            await createDir('plugins')

            const subFolders = await createSubFolders(pluginsDir, 'plugins')

            showSubFolderQuickPick({
                name,
                subFolders,
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

            const filePath = `${path}/${normalizeFileExtension(name, `.${nuxtLang}`)}.${nuxtLang}`


            createFile({
                fileName: `${name}.${nuxtLang}`,
                content: filePath.includes(`${serverDir}`) ? nitroPluginTemplate : nuxtPluginTemplate,
                fullPath: filePath,
            })
        })
}

export { createPlugin, directCreatePlugin }
