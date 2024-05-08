import { window } from 'vscode'
import { createDir, createFile, createSubFolders, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick } from '../utils'

import { generateVueFileTemplate } from '../utils/files'

const createPage = () => {
    window
        .showInputBox({
            prompt: 'What is your page name?',
            placeHolder: 'page name',
        })
        .then(async(name) => {
            if (!name) {return}

            const pagesDir = `${await projectSrcDirectory()}/pages`

            await createDir('pages')

            const subFolders = await createSubFolders(pagesDir, 'pages')

            showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'pages',
                content: generateVueFileTemplate('page'),
            })
        })
}

function directCreatePage(path: string) {
    window
        .showInputBox({
            prompt: 'What is your page name?',
            placeHolder: 'page name',
        })
        .then((name) => {
            if (!name) {return}

            const filePath = `${path}/${normalizeFileExtension(name, '.vue')}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('page'),
                fullPath: filePath,
            })
        })
}

export { createPage, directCreatePage }
