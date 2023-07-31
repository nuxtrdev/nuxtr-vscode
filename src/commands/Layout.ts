import { window } from 'vscode'
import * as fs from 'fs'
import { projectSrcDirectory, createFile, createDir } from '../utils'


import { generateVueFileTemplate } from '../utils/vueFiles'


const createLayout = () => {
    window
        .showInputBox({
            prompt: 'What is your layout name?',
            placeHolder: 'Layout name',
        })
        .then((name) => {
            if (!name) {return}

            let layoutDir = `${projectSrcDirectory()}/layouts`

            createDir('layouts')

            let filePath = `${projectSrcDirectory()}/layouts/${name}.vue`

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
            if (!name) {return}

            let filePath = `${path}/${name}.vue`

            createFile({
                fileName: `${name}.vue`,
                content: generateVueFileTemplate('layout'),
                fullPath: filePath,
            })
        })
}

export { createLayout, directCreateLayout }
