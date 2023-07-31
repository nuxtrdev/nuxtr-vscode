import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir } from '../utils'
import { generateVueFileBasicTemplate } from '../utils/vueFiles'

const createComponent = () => {
    window
        .showInputBox({
            prompt: 'What is your component name?',
            placeHolder: 'component name',
        })
        .then((name) => {
            if (!name) {return}

            let componentsDir = `${projectSrcDirectory()}/components`

            createDir('components')

            let subFolders = createSubFolders(componentsDir, 'components')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'components',
                content: generateVueFileBasicTemplate('component'),
            })
        })
}

const directCreateComponent = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your component name?',
            placeHolder: 'component name',
        })
        .then((name) => {
            if (!name) {return}

            let filePath = `${path}/${name}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileBasicTemplate('component'),
                fullPath: filePath,
            })
        })
}

export { createComponent, directCreateComponent }
