import { window } from 'vscode'
import { projectSrcDirectory, isNuxtTwo, createFile } from '../utils'
import { piniaContent, vuexContent } from '../templates'

const createStore = () => {
    window
        .showInputBox({
            prompt: 'What is your store name?',
            placeHolder: 'store name',
        })
        .then((name: any) => {
            if (!name) { return }

            const filePath = `${projectSrcDirectory()}/${isNuxtTwo() ? 'store' : 'stores'}/${name}.${isNuxtTwo() ? 'js' : 'ts'}`
            if (isNuxtTwo()) {
                createFile({
                    fileName: name,
                    content: vuexContent,
                    fullPath: filePath,
                })
            } else {
                createFile({
                    fileName: name,
                    content: piniaContent(name),
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
        .then((name) => {
            if (!name) { return }

            let filePath = `${path}/${name}.${isNuxtTwo() ? 'js' : 'ts'}`

            if (isNuxtTwo()) {
                createFile({
                    fileName: name,
                    content: vuexContent,
                    fullPath: filePath,
                })
            } else {
                createFile({
                    fileName: name,
                    content: piniaContent(name),
                    fullPath: filePath,
                })
            }

        })
}

export { createStore, directCreateStore }
