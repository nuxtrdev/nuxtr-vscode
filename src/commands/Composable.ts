import { window } from 'vscode'
import { createDir, createFile, createSubFolders, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick, nuxtrConfiguration } from '../utils'
import { composableTemplate } from '../templates'

const nuxtLang = nuxtrConfiguration().nuxtFiles.defaultLanguage

const createComposable = () => {
    window
        .showInputBox({
            prompt: 'What is your composable name?',
            placeHolder: 'composable name',
        })
        .then(async(name) => {

            if (!name) { return }

            const composablesDir = `${await projectSrcDirectory()}/composables`

            createDir('composables')

            const subFolders = await createSubFolders(composablesDir, 'composables')

            showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'composables',
                content: composableTemplate(name),
            })

        })
}

const directCreateComposable = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your composable name?',
            placeHolder: 'composable name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, `.${nuxtLang}`)}.${nuxtLang}`

            createFile({
                fileName: `${name}.${nuxtLang}`,
                content: composableTemplate(name),
                fullPath: filePath,
            })
        })
}

export { createComposable, directCreateComposable }
