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
    updateNuxtConfig,
		nuxtrConfiguration
} from '../utils'

import { vuexContent } from '../templates'

const nuxtLang = nuxtrConfiguration().nuxtFiles.defaultLanguage

async function detectPiniaModule() {
    const moduleName = '@pinia/nuxt'
    const isConfigured = isModuleConfigured(moduleName)
    const installationCommand = await getInstallationCommand(moduleName, true)
    const isInstalled = await isDependencyInstalled(moduleName)


    if (!isInstalled ) {
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

const createStore = () => {
    window
        .showInputBox({
            prompt: 'What is your store name?',
            placeHolder: 'store name',
        })
        .then(async (name: any) => {
            if (!name) { return }

            const filePath = `${await projectSrcDirectory()}/${isNuxtTwo() ? 'store' : 'stores'}/${name}.${isNuxtTwo() ? 'js' : nuxtLang}`
            await (isNuxtTwo() ? createFile({
                fileName: name,
                content: vuexContent,
                fullPath: filePath,
            }) : createFile({
                fileName: name,
                content: generatePiniaTemplates(name),
                fullPath: filePath,
            }));

            await detectPiniaModule()
        })
}

const directCreateStore = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your store name?',
            placeHolder: 'store name',
        })
        .then(async (name) => {
            if (!name) { return }

            const filePath = `${path}/${normalizeFileExtension(name, isNuxtTwo() ? '.js' : `.${nuxtLang}` )}.${isNuxtTwo() ? 'js' : nuxtLang}`

            await (isNuxtTwo() ? createFile({
                fileName: name,
                content: vuexContent,
                fullPath: filePath,
            }) : createFile({
                fileName: name,
                content: generatePiniaTemplates(name),
                fullPath: filePath,
            }));

            await detectPiniaModule()
        })
}

export { createStore, directCreateStore }
