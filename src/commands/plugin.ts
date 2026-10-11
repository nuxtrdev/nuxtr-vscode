/** Prompt for and scaffold plugin files in the selected project’s resolved directories. */
import { scaffoldExtension } from '../utils/files';
import { directServerScaffold, projectDirectory } from '../utils/nuxt';
import { window } from 'vscode'
import { nitroPluginTemplate, nuxtPluginTemplate } from '../templates'
import { createDir, createFile, createSubFolders, hasServerDir, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick } from '../utils'

/** Prompt for a plugin name and create its configured template under the resolved Nuxt directory. */
const createPlugin = () => {
    return window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then(async (name) => {
            if (!name) { return }

            const pluginsDir = projectDirectory('plugins')

            await createDir('plugins')

            const subFolders = await createSubFolders(pluginsDir, 'plugins')

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'plugins',
                content: nuxtPluginTemplate
            })

        })
}


/** Create a file in the Explorer folder supplied by the command. */
const directCreatePlugin = async (path: string) => {
    const server = await directServerScaffold(path);
    if (server === undefined) { return; }

    return window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'plugin name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, scaffoldExtension())}${scaffoldExtension()}`


            return createFile({
                fileName: `${name}${scaffoldExtension()}`,
                content: server ? nitroPluginTemplate : nuxtPluginTemplate,
                fullPath: filePath,
            })
        })
}

export { createPlugin, directCreatePlugin }
