import { window } from 'vscode'
import { createSubFolders, showSubFolderQuickPick, createFile, projectSrcDirectory, createDir, normalizeFileExtension } from '../utils'

import { generateVueFileTemplate } from '../utils/files'

const createPage = async () => {
    window
        .showInputBox({
            prompt: 'What is your page name?',
            placeHolder: 'page name',
        })
        .then(async(name) => {
            if (!name) {return}

            let pagesDir = `${await projectSrcDirectory()}/pages`

            await createDir('pages')

            let subFolders = await createSubFolders(pagesDir, 'pages')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
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

            let filePath = `${path}/${normalizeFileExtension(name, '.vue')}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('page'),
                fullPath: filePath,
            })
        })
}

export { createPage, directCreatePage }
