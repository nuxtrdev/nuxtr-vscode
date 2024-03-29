import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, generateVueFileBasicTemplate, } from '../utils';

const createComponent = () => {
    window
        .showInputBox({
            prompt: 'What is your component name?',
            placeHolder: 'component name',
        })
        .then(async (name) => {
            if (!name) { return }

            let componentsDir = `${await projectSrcDirectory()}/components`

            await createDir('components')

            let subFolders = await createSubFolders(componentsDir, 'components')

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
            if (!name) { return }

            let filePath = `${path}/${name}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileBasicTemplate('component'),
                fullPath: filePath,
            })
        })
}

export { createComponent, directCreateComponent }
