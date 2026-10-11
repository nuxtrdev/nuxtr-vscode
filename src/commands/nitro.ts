/** Prompt for and scaffold nitro files in the selected project’s resolved directories. */
import { projectDirectory } from '../utils/nuxt';
import { window } from 'vscode';
import { nitroDefaultTemplate, nitroPluginTemplate, nitroUtilTemplate, serverMiddlewareTemplate } from '../templates';
import { createDir, createFile, createSubFolders, generateScaffoldTemplate, hasServerDir, normalizeFileExtension, projectSrcDirectory, scaffoldExtension, showSubFolderQuickPick } from '../utils';

/** Prompt for a API handler name and create it under the configured Nitro server directory. */
const createNitroAPI = () => {
    return window
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

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'api',
                content: generateScaffoldTemplate('api', name)
            });
        });
};

/** Prompt for a server route name and create it under the configured Nitro server directory. */
const createNitroRoute = () => {
    return window
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

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'route',
                content: nitroDefaultTemplate
            });
        });
}

/** Prompt for a server plugin name and create it under the configured Nitro server directory. */
const createNitroPlugin = () => {
    return window
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

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'nitroPlugin',
                content: nitroPluginTemplate
            });
        });
}

/** Prompt for a server utility name and create it under the configured Nitro server directory. */
const createNitroUtil = () => {
    return window
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

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'nitroUtil',
                content: nitroUtilTemplate
            });
        });

}

/** Prompt for a request middleware name and create it under the configured Nitro server directory. */
const createNitroMiddleware = () => {
    return window
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

            return showSubFolderQuickPick({
                name,
                subFolders,
                commandType: 'nitroMiddleware',
                content: serverMiddlewareTemplate
            });
        });
}


/** Create a file in the Explorer folder supplied by the command. */
const directCreateNitroAPI = (path: string) => {
    return window
        .showInputBox({
            prompt: 'What is your api name?',
            placeHolder: 'api name',
        })
        .then((name) => {
            if (!name) { return }


            const filePath = `${path}/${normalizeFileExtension(name, scaffoldExtension())}${scaffoldExtension()}`
            return createFile({
                fileName: `${name}${scaffoldExtension()}`,
                content: generateScaffoldTemplate('api', name),
                fullPath: filePath,
            })
        })
}

/** Create a file in the Explorer folder supplied by the command. */
const directCreateNitroRoute = (path: string) => {
    return window
        .showInputBox({
            prompt: 'What is your route name?',
            placeHolder: 'Route name',
        })
        .then((name) => {
            if (!name) { return }


            const filePath = `${path}/${normalizeFileExtension(name, scaffoldExtension())}${scaffoldExtension()}`

            return createFile({
                fileName: `${name}${scaffoldExtension()}`,
                content: nitroDefaultTemplate,
                fullPath: filePath,
            })
        })
}

export {
    createNitroAPI, createNitroMiddleware, createNitroPlugin, createNitroRoute, createNitroUtil, directCreateNitroAPI, directCreateNitroRoute
};
