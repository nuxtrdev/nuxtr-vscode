import { window } from 'vscode'
import { createDir, createFile, createSubFolders, hasServerDir, projectSrcDirectory, showSubFolderQuickPick } from '../utils'
import { nitroUtilTemplate, nuxtUtilTemplate } from '../templates'

const createUtil = () => {
    window
        .showInputBox({
            prompt: 'What is your utility name?',
            placeHolder: 'utility name',
        })
        .then(async (name) => {
            if (!name) { return }

            const utilsDir = `${await projectSrcDirectory()}/utils`

            await createDir('utils')

            const subFolders = await createSubFolders(utilsDir, 'nuxtUtil')

            showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'nuxtUtil',
                content: nuxtUtilTemplate()
            })

        })
}


const directCreateUtil = async (path: string) => {
    const serverDir = await hasServerDir()

    window
        .showInputBox({
            prompt: 'What is your utility name?',
            placeHolder: 'utility name',
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${path}/${name}.ts`


            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroUtilTemplate : nuxtUtilTemplate(),
                fullPath: filePath,
            })
        })
}

export { createUtil, directCreateUtil }
