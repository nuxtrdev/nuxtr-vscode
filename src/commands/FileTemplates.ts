import { window } from 'vscode'
import { existsSync, mkdirSync } from 'node:fs'

import { createFile, createSubFolders, createVueTemplate, generateVueFileBasicTemplate, generateVueFileTemplate, projectRootDirectory, projectSrcDirectory, showSubFolderQuickPick } from '../utils'


function createPageTemplate() {
    const editor = window.activeTextEditor
    if (editor) {
        const selection = editor.selection
        const selectedText = editor.document.getText(selection)

        if (selectedText) {
            const content = selectedText
            createVueTemplate(content, 'page')
        } else {
            const content = editor.document.getText()
            createVueTemplate(content, 'page')
        }
    }
}

function createLayoutTemplate() {
    const editor = window.activeTextEditor
    if (editor) {
        const selection = editor.selection
        const selectedText = editor.document.getText(selection)

        if (selectedText) {
            const content = selectedText
            createVueTemplate(content, 'layout')
        } else {
            const content = editor.document.getText()
            createVueTemplate(content, 'layout')
        }
    }
}

const createFileFromTemplate = (template?: string) => {
    if (template && template.includes('.page-template')) {

        window
            .showInputBox({
                prompt: `What is your page name?`,
                placeHolder: `Page name`,
            })
            .then(async (name) => {
                if (!name) { return }

                const srcDir = `${await projectSrcDirectory()}`
                const pagesDir = `${srcDir}/pages`


                if (srcDir !== undefined && !existsSync(pagesDir)) {
                    mkdirSync(pagesDir)
                }

                const subFolders = createSubFolders(pagesDir, 'pages')

                showSubFolderQuickPick({
                    name,
                    subFolders,
                    commandType: 'pages',
                    content: generateVueFileTemplate(`page`, template),
                })
            })
    } else {
        window
            .showInputBox({
                prompt: 'What is your layout name?',
                placeHolder: 'Layout name',
            })
            .then(async (name) => {
                if (!name) { return }
                const srcDir = `${await projectSrcDirectory()}`
                const layoutDir = `${srcDir}/layouts`

                if (srcDir !== undefined && !existsSync(layoutDir)) {
                    mkdirSync(layoutDir)
                }

                const filePath = `${srcDir}/layouts/${name}.vue`

                createFile({
                    fileName: `${name}.vue`,
                    content: generateVueFileTemplate(`layout`, template),
                    fullPath: filePath,
                })
            })
    }
}

const createFileTemplate = (type: string) => {

    window
        .showInputBox({
            prompt: `What is your ${type} name?`,
            placeHolder: `${type} name`,
        })
        .then((name) => {
            if (!name) { return }

            const filePath = `${projectRootDirectory()}/.vscode/${name}.${type}-template`

            createFile({
                fileName: `${name}.${type}-template`,
                content: generateVueFileBasicTemplate(`${type}`),
                fullPath: filePath,
            })
        })
}


const createEmptyFileTemplate = () => {
    const templates = ['Page', 'Layout']

    window
        .showQuickPick(templates, {
            canPickMany: false,
            placeHolder: 'Select file type',
        })
        .then((selection) => {
            if (selection === 'Page') {
                createFileTemplate('page')
            }

            if (selection === 'Layout') {
                createFileTemplate('layout')
            }
        })

}

export { createPageTemplate, createLayoutTemplate, createFileFromTemplate, createEmptyFileTemplate }