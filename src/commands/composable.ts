import { window } from 'vscode'
import { composableTemplate } from '../templates'
import { createDir, createFile, createSubFolders, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick } from '../utils'

const neglectUsePrefix = (name: string) => name.replace(/^use/i, '')

const createComposable = () => {
    window
        .showInputBox({
            prompt: 'What is your composable name?',
            placeHolder: 'composable name',
        })
        .then(async (name) => {

            if (!name) { return }

            const composablesDir = `${await projectSrcDirectory()}/composables`

            createDir('composables')

            const subFolders = await createSubFolders(composablesDir, 'composables')

            showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'composables',
                content: composableTemplate(neglectUsePrefix(name)),
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

            const filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`

            createFile({
                fileName: `${name}.ts`,
                content: composableTemplate(neglectUsePrefix(name)),
                fullPath: filePath,
            })
        })
}

export { createComposable, directCreateComposable }
