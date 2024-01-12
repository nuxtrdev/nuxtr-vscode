import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, hasServerDir, normalizeFileExtension} from '../utils'
import { nuxtMiddlewareTemplate, nitroDefaultTemplate } from '../templates'

const createMiddleware = () => {
    window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then(async (name) => {

            if (!name) { return }

            let middlewareDir = `${await projectSrcDirectory()}/middleware`

            await createDir('middleware')

            let subFolders = await createSubFolders(middlewareDir, 'middleware')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
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

            let filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`

            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroDefaultTemplate : nuxtMiddlewareTemplate,
                fullPath: filePath,
            })
        })
}

export { createMiddleware, directCreateMiddleware }
