import { window } from 'vscode'
import { createDir, createFile, createSubFolders, hasServerDir, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick, nuxtrConfiguration } from '../utils'
import { nitroDefaultTemplate, nuxtMiddlewareTemplate } from '../templates'

const nuxtLang = nuxtrConfiguration().nuxtFiles.defaultLanguage

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

            const filePath = `${path}/${normalizeFileExtension(name, `.${nuxtLang}`)}.${nuxtLang}`

            createFile({
                fileName: `${name}.${nuxtLang}`,
                content: filePath.includes(`${serverDir}`) ? nitroDefaultTemplate : nuxtMiddlewareTemplate,
                fullPath: filePath,
            })
        })
}

export { createMiddleware, directCreateMiddleware }
