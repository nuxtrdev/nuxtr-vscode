import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir } from '../utils'
import { middlewareTemplate } from '../templates/typeScriptFiles'

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
                content: middlewareTemplate
            })


        })
}

const directCreateMiddleware = (path: string) => {
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
                content: middlewareTemplate,
                fullPath: filePath,
            })
        })
}

export { createMiddleware, directCreateMiddleware }
