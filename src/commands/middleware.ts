/** Prompt for and scaffold middleware files in the selected project’s resolved directories. */
import { scaffoldExtension } from '../utils/files';
import { directServerScaffold, projectDirectory } from '../utils/nuxt';
import { window } from 'vscode'
import { nuxtMiddlewareTemplate, serverMiddlewareTemplate } from '../templates'
import { createDir, createFile, createSubFolders, hasServerDir, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick } from '../utils'

/** Prompt for a middleware name and create its configured template under the resolved Nuxt directory. */
const createMiddleware = () => {
    return window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then(async (name) => {

            if (!name) { return }

            const middlewareDir = projectDirectory('middleware')

            await createDir('middleware')

            const subFolders = await createSubFolders(middlewareDir, 'middleware')

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'middleware',
                content: nuxtMiddlewareTemplate
            })


        })
}

/** Create a file in the Explorer folder supplied by the command. */
const directCreateMiddleware = async (path: string) => {
    const server = await directServerScaffold(path);
    if (server === undefined) { return; }

    return window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, scaffoldExtension())}${scaffoldExtension()}`

            return createFile({
                fileName: `${name}${scaffoldExtension()}`,
                content: server ? serverMiddlewareTemplate : nuxtMiddlewareTemplate,
                fullPath: filePath,
            })
        })
}

export { createMiddleware, directCreateMiddleware }
