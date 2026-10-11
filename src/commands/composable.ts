/** Prompt for and scaffold composable files in the selected project’s resolved directories. */
import { scaffoldFileName } from '../core/templates';
import { projectDirectory } from '../utils/nuxt';
import { window } from 'vscode'
import { createDir, createFile, createSubFolders, generateScaffoldTemplate, nuxtrConfiguration, showSubFolderQuickPick } from '../utils'

/** Prompt for a composable name and create its configured template under the resolved Nuxt directory. */
const createComposable = () => {
    return window
        .showInputBox({
            prompt: 'What is your composable name?',
            placeHolder: 'composable name',
        })
        .then(async (name) => {

            if (!name) { return }

            const composablesDir = projectDirectory('composables')

            await createDir('composables')

            const subFolders = await createSubFolders(composablesDir, 'composables')

            return showSubFolderQuickPick({
                name: scaffoldFileName(name, 'composable', nuxtrConfiguration().scaffolding.defaultLanguage, nuxtrConfiguration().scaffolding.composableUsePrefix),
                subFolders,
                commandType: 'composables',
                content: generateScaffoldTemplate('composable', name),
            })

        })
}

/** Create a file in the Explorer folder supplied by the command. */
const directCreateComposable = (path: string) => {
    return window
        .showInputBox({
            prompt: 'What is your composable name?',
            placeHolder: 'composable name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${scaffoldFileName(name, 'composable', nuxtrConfiguration().scaffolding.defaultLanguage, nuxtrConfiguration().scaffolding.composableUsePrefix)}`

            return createFile({
                fileName: `${name}.ts`,
                content: generateScaffoldTemplate('composable', name),
                fullPath: filePath,
            })
        })
}

export { createComposable, directCreateComposable }
