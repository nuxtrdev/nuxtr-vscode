import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, hasServerDir, createDir } from '../utils'
import { nitroDefaultTemplate, nitroPluginTemplate, nitroUtilTemplate } from '../templates/typeScriptFiles'

let serverDir = `${projectSrcDirectory()}/${hasServerDir()}/`


const createNitroAPI = () => {
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
                content: nitroDefaultTemplate
            })
        })
}

const createNitroRoute = () => {
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
                content: nitroDefaultTemplate
            })
        })
}

const createNitroPlugin = () => {
    const pluginsDir = `${serverDir}/plugins`

    window
        .showInputBox({
            prompt: 'What is your route name?',
            placeHolder: 'Route name',
        })
        .then((name) => {
            if (!name) { return }


            createDir('server')
            createDir('server/plugins')

            let subFolders = createSubFolders(pluginsDir, 'nitroPlugin')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nitroPlugin',
                content: nitroPluginTemplate
            })
        })
}

const createNitroUtil = () => {
    const utilsDir = `${serverDir}/plugins`

    window
        .showInputBox({
            prompt: 'What is your utility name?',
            placeHolder: 'Utility name',
        })
        .then((name) => {
            if (!name) { return }


            createDir('server')
            createDir('server/plugins')

            let subFolders = createSubFolders(utilsDir, 'nitroUtil')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nitroUtil',
                content: nitroUtilTemplate
            })
        })
}

const createNitroMiddleware = () => {
    const middlewareDir = `${serverDir}/middleware`

    window
        .showInputBox({
            prompt: 'What is your route name?',
            placeHolder: 'Route name',
        })
        .then((name) => {
            if (!name) { return }


            createDir('server')
            createDir('server/middleware')

            let subFolders = createSubFolders(middlewareDir, 'nitroMiddleware')

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nitroMiddleware',
                content: nitroDefaultTemplate
            })
        })
}


const directCreateNitroAPI = (path: string) => {
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
                content: nitroDefaultTemplate,
                fullPath: filePath,
            })
        })
}

const directCreateNitroRoute = (path: string) => {
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
                content: nitroDefaultTemplate,
                fullPath: filePath,
            })
        })
}

export {
    createNitroAPI,
    directCreateNitroAPI,
    createNitroRoute,
    directCreateNitroRoute,
    createNitroPlugin,
    createNitroMiddleware,
    createNitroUtil
}
