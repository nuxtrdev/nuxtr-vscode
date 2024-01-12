import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, createDir, hasServerDir } from '../utils'
import { nuxtUtilTemplate, nitroUtilTemplate } from '../templates'

const createUtil = () => {
    window
        .showInputBox({
            prompt: 'What is your utility name?',
            placeHolder: 'utility name',
        })
        .then(async (name) => {
            if (!name) { return }

            let utilsDir = `${await projectSrcDirectory()}/utils`

            await createDir('utils')

            let subFolders = await createSubFolders(utilsDir, 'nuxtUtil')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nuxtUtil',
                content: nuxtUtilTemplate(name)
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

            let filePath = `${path}/${name}.ts`


            createFile({
                fileName: `${name}.ts`,
                content: filePath.includes(`${serverDir}`) ? nitroUtilTemplate : nuxtUtilTemplate(name),
                fullPath: filePath,
            })
        })
}

export { createUtil, directCreateUtil }
