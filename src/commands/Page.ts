import { window } from 'vscode'
import { createSubFolders, showSubFolderQuickPick, createFile, projectSrcDirectory, createDir } from '../utils'

import { generateVueFileTemplate } from '../utils/files'

const createPage = () => {
    window
        .showInputBox({
            prompt: 'What is your page name?',
            placeHolder: 'page name',
        })
        .then((name) => {
            if (!name) {return}

            let pagesDir = `${projectSrcDirectory()}/pages`

            createDir('pages')

            let subFolders = createSubFolders(pagesDir, 'pages')

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

            let filePath = `${path}/${name}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('page'),
                fullPath: filePath,
            })
        })
}

export { createPage, directCreatePage }
