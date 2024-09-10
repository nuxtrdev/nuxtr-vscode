import { window } from 'vscode'
import { createDir, createFile, createSubFolders, hasServerDir, normalizeFileExtension, projectSrcDirectory, showSubFolderQuickPick, nuxtrConfiguration } from '../utils'
import { nitroDefaultTemplate, nitroPluginTemplate, nitroUtilTemplate } from '../templates'

const nuxtLang = nuxtrConfiguration().nuxtFiles.defaultLanguage

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
            const apisDir = `${await projectSrcDirectory()}/${await hasServerDir()}/api`

            const subFolders = await createSubFolders(apisDir, 'api');

            showSubFolderQuickPick({
                name,
                subFolders,
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
            const composablesDir = `${await projectSrcDirectory()}/${await hasServerDir()}/routes`

            const subFolders = await createSubFolders(composablesDir, 'route');

            showSubFolderQuickPick({
                name,
                subFolders,
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
            const composablesDir = `${await projectSrcDirectory()}/${await hasServerDir()}/plugins`

            const subFolders = await createSubFolders(composablesDir, 'nitroPlugin');

            showSubFolderQuickPick({
                name,
                subFolders,
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
            const composablesDir = `${await projectSrcDirectory()}/${await hasServerDir()}/utils`

            const subFolders = await createSubFolders(composablesDir, 'nitroUtil');

            showSubFolderQuickPick({
                name,
                subFolders,
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
            const middlewareDir = `${await projectSrcDirectory()}/${await hasServerDir()}/middleware`
            const subFolders = await createSubFolders(middlewareDir, 'nitroMiddleware');

            showSubFolderQuickPick({
                name,
                subFolders,
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

            const filePath = `${path}/${normalizeFileExtension(name, `.${nuxtLang}`)}.${nuxtLang}`
            createFile({
                fileName: `${name}.${nuxtLang}`,
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

            const filePath = `${path}/${normalizeFileExtension(name, `.${nuxtLang}`)}.${nuxtLang}`

            createFile({
                fileName: `${name}.${nuxtLang}`,
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
