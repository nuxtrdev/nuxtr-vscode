/** Prompt for and scaffold component files in the selected project’s resolved directories. */
import { projectDirectory } from '../utils/nuxt';
import { window } from 'vscode';
import { createDir, createFile, createSubFolders, generateVueFileTemplate, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick, } from '../utils';

/** Prompt for a component name and create its configured template under the resolved Nuxt directory. */
const createComponent = () => {
    return window
        .showInputBox({
            prompt: 'What is your component name?',
            placeHolder: 'component name',
        })
        .then(async (name) => {
            if (!name) { return }

            const componentsDir = projectDirectory('components')

            await createDir('components')

            const subFolders = await createSubFolders(componentsDir, 'components')

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'components',
                content: generateVueFileTemplate('component'),
            })
        })
}

/** Create a file in the Explorer folder supplied by the command. */
const directCreateComponent = (path: string) => {
    return window
        .showInputBox({
            prompt: 'What is your component name?',
            placeHolder: 'component name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, '.vue')}.vue`

            return createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('component'),
                fullPath: filePath,
            })
        })
}

export { createComponent, directCreateComponent };
