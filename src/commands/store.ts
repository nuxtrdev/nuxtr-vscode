/** Prompt for and scaffold store files in the selected project’s resolved directories. */
import { containsPath } from '../core/project';
import { scaffoldExtension } from '../utils/files';
import { projectDirectory } from '../utils/nuxt';
import { window } from 'vscode'
import {
    createFile,
    generatePiniaTemplates,
    getInstallationCommand,
    isDependencyInstalled,
    isModuleConfigured,
    isNuxtTwo,
    normalizeFileExtension,
    projectSrcDirectory,
    runCommand,
    updateNuxtConfig
} from '../utils'

import { vuexContent } from '../templates'

/** Install and configure Pinia when the selected project does not already provide it. */
async function detectPiniaModule () {
    const moduleName = '@pinia/nuxt'
    const isConfigured = isModuleConfigured(moduleName)
    const isInstalled = await isDependencyInstalled(moduleName)


    if (!isInstalled ) {
        const installationCommand = await getInstallationCommand(moduleName, true);
        await runCommand({
            command: installationCommand,
            message: 'Installing @pinia/nuxt module',
            successMessage: 'Pinia module installed successfully',
            errorMessage: 'Pinia module installation failed',
            docsURL: 'https://pinia.vuejs.org/'
        })
    }

    if (!isConfigured) {
        await updateNuxtConfig('add-module', moduleName)
    }

}

/** Prompt for a store name and create its configured template under the resolved Nuxt directory. */
const createStore = () => {
    return window
        .showInputBox({
            prompt: 'What is your store name?',
            placeHolder: 'store name',
        })
        .then(async (name: any) => {
            if (!name) { return }

            const filePath = `${projectDirectory(isNuxtTwo() ? 'store' : 'stores')}/${normalizeFileExtension(name, isNuxtTwo() ? '.js' : scaffoldExtension())}${isNuxtTwo() ? '.js' : scaffoldExtension()}`
            const created = await (isNuxtTwo() ? createFile({
                fileName: name,
                content: vuexContent,
                fullPath: filePath,
            }) : createFile({
                fileName: name,
                content: generatePiniaTemplates(name),
                fullPath: filePath,
            }));

            if (!created) { return; }
            if (!isNuxtTwo()) { await detectPiniaModule(); }
        })
}

/** Create a file in the Explorer folder supplied by the command. */
const directCreateStore = (path: string) => {
    return window
        .showInputBox({
            prompt: 'What is your store name?',
            placeHolder: 'store name',
        })
        .then(async (name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, isNuxtTwo() ? '.js' : scaffoldExtension())}${isNuxtTwo() ? '.js' : scaffoldExtension()}`

            const created = await (isNuxtTwo() ? createFile({
                fileName: name,
                content: vuexContent,
                fullPath: filePath,
            }) : createFile({
                fileName: name,
                content: generatePiniaTemplates(name),
                fullPath: filePath,
            }));

            if (!created) { return; }
            if (!isNuxtTwo()) { await detectPiniaModule(); }
        })
}

export { createStore, directCreateStore }
