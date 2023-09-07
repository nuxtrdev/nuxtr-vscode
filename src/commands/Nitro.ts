import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, hasServerDir, createDir } from '../utils'
import { apiTemplate } from '../templates/typeScriptFiles'

let serverDir = `${projectSrcDirectory()}/${hasServerDir()}/`


const createApi = () => {
    const apiDir = `${serverDir}/api`

    window
        .showInputBox({
            prompt: 'What is your API name?',
            placeHolder: 'API name',
        })
        .then((name) => {
            if (!name) { return }


            createDir('server')
            createDir('server/api')

            let subFolders = createSubFolders(apiDir, 'api')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'api',
                content: apiTemplate(name)
            })
        })
}

const createRoute = () => {
    const routeDir = `${serverDir}/routes`

    window
        .showInputBox({
            prompt: 'What is your route name?',
            placeHolder: 'Route name',
        })
        .then((name) => {
            if (!name) { return }


            createDir('server')
            createDir('server/routes')

            let subFolders = createSubFolders(routeDir, 'route')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'route',
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

            createDir('server')
            createDir('server/api')

            let filePath = `${path}/${name}.ts`
            createFile({
                fileName: `${name}.ts`,
                content: apiTemplate(name),
                fullPath: filePath,
            })
        })
}

const directCreateRoute = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your route name?',
            placeHolder: 'Route name',
        })
        .then((name) => {
            if (!name) { return }

            createDir('server')
            createDir('server/routes')

            let filePath = `${path}/${name}.ts`

            createFile({
                fileName: `${name}.ts`,
                content: apiTemplate(name),
                fullPath: filePath,
            })
        })
}

export { createApi, directCreateApi, createRoute, directCreateRoute}
