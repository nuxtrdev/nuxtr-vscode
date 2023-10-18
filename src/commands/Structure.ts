import { window } from 'vscode'
import { mkdirSync, existsSync } from 'node:fs'
import { isNuxtTwo, createFile, projectRootDirectory, projectSrcDirectory } from '../utils'
import { appConfigContent } from '../templates'
import { generateVueFileTemplate } from '../utils/files'

function promptDirectorySelection() {
    let directories = [
        'components',
        'pages',
        'assets',
        'plugins',
        'layouts',
        'middleware',
        'modules',
    ]

    let nuxtTwoDirectories = ['static', 'store',]

    let nuxtThreeDirectories = ['public', 'composables', 'server', 'utils', 'stores']

    isNuxtTwo()
        ? (directories = [...directories, ...nuxtTwoDirectories])
        : (directories = [...directories, ...nuxtThreeDirectories])

    window
        .showQuickPick(directories, {
            canPickMany: true,
            placeHolder: 'Select directories to create',
        })
        .then((selectedDirs) => {
            if (selectedDirs !== undefined && selectedDirs.length > 0) {
                selectedDirs.forEach((dir) => {
                    let path = `${projectSrcDirectory()}/${dir}`
                    if (!existsSync(path)) {
                        mkdirSync(path)
                    }

                    if (dir === 'pages') {
                        createFile({
                            fileName: `index.vue`,
                            content: generateVueFileTemplate('page'),
                            fullPath: `${path}/index.vue`,
                        })
                    }
                })
            }
        })
}

const projectStructure = () => {
    promptDirectorySelection()
}

const appConfig = () => {
    createFile({
        fileName: 'app.config.ts',
        content: appConfigContent,
        fullPath: `${projectRootDirectory()}/app.config.ts`,
    })
}

const nuxtIgnore = () => {
    createFile({
        fileName: '.nuxtignore',
        content: '',
        fullPath: `${projectRootDirectory()}/.nuxtignore`,
    })
}

const nuxtRC = () => {
    createFile({
        fileName: '.nuxtrc',
        content: '',
        fullPath: `${projectRootDirectory()}/.nuxtrc`,
    })
}

export { projectStructure, appConfig, nuxtIgnore, nuxtRC }
