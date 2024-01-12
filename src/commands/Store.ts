import { window } from 'vscode'
import { projectSrcDirectory, isNuxtTwo, createFile, generatePiniaTemplates, normalizeFileExtension } from '../utils'
import { vuexContent } from '../templates'

const createStore = () => {
    window
        .showInputBox({
            prompt: 'What is your store name?',
            placeHolder: 'store name',
        })
        .then(async (name: any) => {
            if (!name) { return }

            const filePath = `${await projectSrcDirectory()}/${isNuxtTwo() ? 'store' : 'stores'}/${name}.${isNuxtTwo() ? 'js' : 'ts'}`
            if (isNuxtTwo()) {
                await  createFile({
                    fileName: name,
                    content: vuexContent,
                    fullPath: filePath,
                })
            } else {
                await createFile({
                    fileName: name,
                    content: generatePiniaTemplates(name),
                    fullPath: filePath,
                })
            }
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

            let filePath = `${path}/${normalizeFileExtension(name, isNuxtTwo() ? '.js' : '.ts' )}.${isNuxtTwo() ? 'js' : 'ts'}`

            if (isNuxtTwo()) {
                await createFile({
                    fileName: name,
                    content: vuexContent,
                    fullPath: filePath,
                })
            } else {
                await createFile({
                    fileName: name,
                    content: generatePiniaTemplates(name),
                    fullPath: filePath,
                })
            }

        })
}

export { createStore, directCreateStore }
