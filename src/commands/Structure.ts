import { window } from 'vscode'
import { mkdirSync, existsSync } from 'node:fs'
import { isNuxtTwo, createFile, projectRootDirectory, projectSrcDirectory, generateVueFileTemplate } from '../utils'
import { appConfigContent } from '../templates'

function promptDirectorySelection() {
    let directories = ['components', 'pages', 'assets', 'plugins', 'layouts', 'middleware', 'modules',]

    let nuxtTwoDirectories = ['static', 'store',]

    let nuxtThreeDirectories = ['public', 'composables', 'server', 'utils', 'stores']

    isNuxtTwo() ? (directories = [...directories, ...nuxtTwoDirectories]) : (directories = [...directories, ...nuxtThreeDirectories])

    directories.sort()

    window
        .showQuickPick(directories, {
            canPickMany: true,
            placeHolder: 'Select directories to create',
        })
        .then((selectedDirs) => {
            if (selectedDirs !== undefined && selectedDirs.length > 0) {
                selectedDirs.forEach(async (dir) => {
                    let dirPath = `${await projectSrcDirectory()}/${dir}`
                    if (!existsSync(dirPath)) {
                        mkdirSync(dirPath)
                    }

                    if (dir === 'pages') {
                        await createFile({
                            fileName: `index.vue`,
                            content: generateVueFileTemplate('page'),
                            fullPath: `${dirPath}/index.vue`,
                        })
                    }

                    if (dir === 'layouts') {
                        await createFile({
                            fileName: `default.vue`,
                            content: generateVueFileTemplate('layout'),
                            fullPath: `${dirPath}/default.vue`,
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

const errorLayout = async () => {
    const filePath = `${await projectSrcDirectory()}/error.vue`

    await createFile({
        fileName: 'error.vue',
        content: generateVueFileTemplate('page'),
        fullPath: filePath,
    })
}

export { projectStructure, appConfig, nuxtIgnore, nuxtRC, errorLayout }
