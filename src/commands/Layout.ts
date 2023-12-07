import { window } from 'vscode'
import { projectSrcDirectory, createFile, createDir, normalizeFileExtension } from '../utils'


import { generateVueFileTemplate } from '../utils/files'


const createLayout = () => {
    window
        .showInputBox({
            prompt: 'What is your layout name?',
            placeHolder: 'Layout name',
        })
        .then((name) => {
            if (!name) { return }

            let layoutDir = `${projectSrcDirectory()}/layouts`

            createDir('layouts')

            let filePath = `${projectSrcDirectory()}/layouts/${normalizeFileExtension(name, '.vue')}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('layout'),
                fullPath: filePath,
            })
        })
}

const directCreateLayout = (path: string) => {
    window
        .showInputBox({
            prompt: 'What is your layout name?',
            placeHolder: 'layout name',
        })
        .then((name) => {
            if (!name) { return }

            let filePath = `${path}/${normalizeFileExtension(name, '.vue')}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('layout'),
                fullPath: filePath,
            })
        })
}

export { createLayout, directCreateLayout }
