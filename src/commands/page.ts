/** Prompt for and scaffold page files in the selected project’s resolved directories. */
import { projectDirectory } from '../utils/nuxt';
import { window } from 'vscode'
import { createDir, createFile, createSubFolders, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick } from '../utils'
import { generateVueFileTemplate } from '../utils/files'

/** Prompt for a page name and create its configured template under the resolved Nuxt directory. */
const createPage = () => {
    return window
        .showInputBox({
            prompt: 'What is your page name?',
            placeHolder: 'page name',
        })
        .then(async (name) => {
            if (!name) {return}

            const pagesDir = projectDirectory('pages')

            await createDir('pages')

            const subFolders = await createSubFolders(pagesDir, 'pages')

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'pages',
                content: generateVueFileTemplate('page'),
            })
        })
}

/** Create a file in the Explorer folder supplied by the command. */
function directCreatePage (path: string) {
    return window
        .showInputBox({
            prompt: 'What is your page name?',
            placeHolder: 'page name',
        })
        .then((name) => {
            if (!name) {return}

            const filePath = `${path}/${normalizeFileExtension(name, '.vue')}.vue`

            return createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('page'),
                fullPath: filePath,
            })
        })
}

export { createPage, directCreatePage }
