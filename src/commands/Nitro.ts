import { window } from 'vscode'
import { projectSrcDirectory, createSubFolders, showSubFolderQuickPick, createFile, hasServerDir, createDir, normalizeFileExtension } from '../utils'
import { nitroDefaultTemplate, nitroPluginTemplate, nitroUtilTemplate } from '../templates'

let serverDir = `${projectSrcDirectory()}/${hasServerDir()}/`


const createNitroAPI = () => {
    window
        .showInputBox({
            prompt: 'What is your API name?',
            placeHolder: 'API name',
        })
        .then(async (name) => {
            if (!name) {
                return;
            }
            const serverDirName = await hasServerDir();
            await createDir(`${serverDirName}`);
            await createDir(`${serverDirName}/api`);
            let apisDir = `${await projectSrcDirectory()}/${await hasServerDir()}/api`

            let subFolders = await createSubFolders(apisDir, 'api');

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'api',
                content: nitroDefaultTemplate
            });
        });
};

const createNitroRoute = () => {
    window
        .showInputBox({
            prompt: 'What is your route name?',
            placeHolder: 'Route name',
        })
        .then(async (name) => {
            if (!name) {
                return;
            }
            const serverDirName = await hasServerDir();
            await createDir(`${serverDirName}`);
            await createDir(`${serverDirName}/routes`);
            let composablesDir = `${await projectSrcDirectory()}/${await hasServerDir()}/routes`

            let subFolders = await createSubFolders(composablesDir, 'route');

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'route',
                content: nitroDefaultTemplate
            });
        });
}

const createNitroPlugin = () => {
    window
        .showInputBox({
            prompt: 'What is your plugin name?',
            placeHolder: 'Plugin name',
        })
        .then(async (name) => {
            if (!name) {
                return;
            }
            const serverDirName = await hasServerDir();
            await createDir(`${serverDirName}`);
            await createDir(`${serverDirName}/plugins`);
            let composablesDir = `${await projectSrcDirectory()}/${await hasServerDir()}/plugins`

            let subFolders = await createSubFolders(composablesDir, 'nitroPlugin');

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nitroPlugin',
                content: nitroPluginTemplate
            });
        });
}

const createNitroUtil = () => {
    window
        .showInputBox({
            prompt: 'What is your utility name?',
            placeHolder: 'Utility name',
        })
        .then(async (name) => {
            if (!name) {
                return;
            }
            const serverDirName = await hasServerDir();
            await createDir(`${serverDirName}`);
            await createDir(`${serverDirName}/utils`);
            let composablesDir = `${await projectSrcDirectory()}/${await hasServerDir()}/utils`

            let subFolders = await createSubFolders(composablesDir, 'nitroUtil');

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nitroUtil',
                content: nitroUtilTemplate
            });
        });

}

const createNitroMiddleware = () => {
    window
        .showInputBox({
            prompt: 'What is your middleware name?',
            placeHolder: 'Middleware name',
        })
        .then(async (name) => {
            if (!name) {
                return;
            }
            const serverDirName = await hasServerDir();
            await createDir(`${serverDirName}`);
            await createDir(`${serverDirName}/middleware`);
            let middlewareDir = `${await projectSrcDirectory()}/${await hasServerDir()}/middleware`
            let subFolders = await createSubFolders(middlewareDir, 'nitroMiddleware');

            showSubFolderQuickPick({
                name,
                subFolders: subFolders,
                commandType: 'nitroMiddleware',
                content: nitroDefaultTemplate
            });
        });
}


const directCreateNitroAPI = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your api name?',
            placeHolder: 'api name',
        })
        .then(async (name) => {
            if (!name) { return }

            await createDir('server')
            await createDir('server/api')

            let filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`
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

            let filePath = `${path}/${normalizeFileExtension(name, '.ts')}.ts`

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
