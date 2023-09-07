import { window } from 'vscode'
import * as fs from 'fs'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, hasServerDir } from '../utils'
import { apiTemplate } from '../templates/typeScriptFiles'

let serverDir = `${projectSrcDirectory()}/${hasServerDir()}/api`


const createApi = () => {
    window
        .showInputBox({
            prompt: 'What is your api name?',
            placeHolder: 'Api name',
        })
        .then((name) => {
            if (!name) { return }


            if (projectSrcDirectory() !== undefined) {
                if (!fs.existsSync(serverDir)) {
                    fs.mkdirSync(serverDir, { recursive: true })
                }
            }

            let subFolders = createSubFolders(serverDir, 'api')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'api',
                content: apiTemplate(name)
            })
        })
}


const directCreateApi = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your api name?',
            placeHolder: 'api name',
        })
        .then((name) => {
            if (!name) { return }
            if (projectSrcDirectory() !== undefined) {
                if (!fs.existsSync(serverDir)) {
                    fs.mkdirSync(serverDir)
                }
            }

            let filePath = `${path}/${name}.ts`
            createFile({
                fileName: `${name}.ts`,
                content: apiTemplate(name),
                fullPath: filePath,
            })
        })
}

export { createApi, directCreateApi }
