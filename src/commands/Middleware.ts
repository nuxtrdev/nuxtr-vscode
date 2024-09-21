import { window } from 'vscode'
import { nitroDefaultTemplate, nuxtMiddlewareTemplate } from '../templates'
import { createDir, createFile, createSubFolders, hasServerDir, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick } from '../utils'

const createMiddleware = () => {
    window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then(async (name) => {

            if (!name) { return }

            const middlewareDir = `${await projectSrcDirectory()}/middleware`

            await createDir('middleware')

            const subFolders = await createSubFolders(middlewareDir, 'middleware')

            showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'middleware',
                content: nuxtMiddlewareTemplate
            })


        })
}

const directCreateMiddleware = async (path: string) => {
    const serverDir = await hasServerDir()

    window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`

            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroDefaultTemplate : nuxtMiddlewareTemplate,
                fullPath: filePath,
            })
        })
}

export { createMiddleware, directCreateMiddleware }
