import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, normalizeFileExtension } from '../utils'
import { composableTemplate } from '../templates'

const createComposable = () => {
    window
        .showInputBox({
            prompt: 'What is your composable name?',
            placeHolder: 'composable name',
        })
        .then((name) => {

            if (!name) { return }

            let composablesDir = `${projectSrcDirectory()}/composables`

            createDir('composables')

            let subFolders = createSubFolders(composablesDir, 'composables')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
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

            let filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`

            createFile({
                fileName: `${name}.ts`,
                content: composableTemplate(name),
                fullPath: filePath,
            })
        })
}

export { createComposable, directCreateComposable }
