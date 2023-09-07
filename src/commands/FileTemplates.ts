import { window } from 'vscode'
import * as fs from 'fs'

import { projectSrcDirectory, createFile, createSubFolders, showSubFolderQuickPick, createVueTemplate, generateVueFileTemplate, generateVueFileBasicTemplate  } from '../utils'


function createPageTemplate() {
    let editor = window.activeTextEditor
    if (editor) {
        let selection = editor.selection
        let selectedText = editor.document.getText(selection)

        if (selectedText) {
            let content = selectedText
            createVueTemplate(content, 'page')
        } else {
            let content = editor.document.getText()
            createVueTemplate(content, 'page')
        }
    }
}

function createLayoutTemplate() {
    let editor = window.activeTextEditor
    if (editor) {
        let selection = editor.selection
        let selectedText = editor.document.getText(selection)

        if (selectedText) {
            let content = selectedText
            createVueTemplate(content, 'layout')
        } else {
            let content = editor.document.getText()
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
            .then((name) => {
                if (!name) {return}

                let pagesDir = `${projectSrcDirectory()}/pages`


                if (projectSrcDirectory() !== undefined) {
                    if (!fs.existsSync(pagesDir)) {
                        fs.mkdirSync(pagesDir)
                    }
                }

                let subFolders = createSubFolders(pagesDir, 'pages')

                showSubFolderQuickPick({
                    name,
                    subFolders: subFolders,
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
            .then((name) => {
                if (!name) {return}

                let layoutDir = `${projectSrcDirectory()}/layouts`

                if (projectSrcDirectory() !== undefined) {
                    if (!fs.existsSync(layoutDir)) {
                        fs.mkdirSync(layoutDir)
                    }
                }

                let filePath = `${projectSrcDirectory()}/layouts/${name}.vue`

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
            if (!name) {return}

            let filePath = `${projectSrcDirectory()}/.vscode/${name}.${type}-template`

            createFile({
                fileName: `${name}.${type}-template`,
                content: generateVueFileBasicTemplate(`${type}`),
                fullPath: filePath,
            })
        })
}


const createEmptyFileTemplate = (template?: string) => {
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