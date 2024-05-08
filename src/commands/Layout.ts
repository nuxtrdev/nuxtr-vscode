import { window } from 'vscode'
import { createDir, createFile, normalizeFileExtension, projectSrcDirectory } from '../utils'


import { generateVueFileTemplate } from '../utils/files'


const createLayout = () => {
    window
        .showInputBox({
            prompt: 'What is your layout name?',
            placeHolder: 'Layout name',
        })
        .then(async (name) => {
            if (!name) { return }

            createDir('layouts')

            const filePath = `${await projectSrcDirectory()}/layouts/${normalizeFileExtension(name, '.vue')}.vue`

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

            const filePath = `${path}/${normalizeFileExtension(name, '.vue')}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('layout'),
                fullPath: filePath,
            })
        })
}

export { createLayout, directCreateLayout }
