import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, hasServerDir } from '../utils'
import { nuxtMiddlewareTemplate, nitroDefaultTemplate } from '../templates/typeScriptFiles'

const createMiddleware = () => {
    window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then((name) => {

            if (!name) {return}

            let middlewareDir = `${projectSrcDirectory()}/middleware`

            createDir('middleware')

            let subFolders = createSubFolders(middlewareDir, 'middleware')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'middleware',
                content: nuxtMiddlewareTemplate
            })


        })
}

const directCreateMiddleware = (path: string) => {
    const serverDir = hasServerDir()

    window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'middleware name',
        })
        .then((name) => {
            if (!name) {return}

            let filePath = `${path}/${name}.ts`

            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroDefaultTemplate : nuxtMiddlewareTemplate,
                fullPath: filePath,
            })
        })
}

export { createMiddleware, directCreateMiddleware }
