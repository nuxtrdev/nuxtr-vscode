/** Scaffold selected Nuxt directories and root/application configuration files. */
import { DirectoryKind } from '../core/directories';
import { projectDirectory } from '../utils/nuxt';
import { existsSync, mkdirSync } from 'node:fs'
import { window } from 'vscode'
import { appConfigContent } from '../templates'
import { createFile, generateVueFileTemplate, isNuxtTwo, projectRootDirectory, projectSrcDirectory } from '../utils'

/** Offer a directory checklist and create files in the resolved Nuxt layout. */
function promptDirectorySelection () {
    let directories = ['components', 'pages', 'assets', 'plugins', 'layouts', 'middleware', 'modules',]

    const nuxtTwoDirectories = ['static', 'store',]

    const nuxtThreeDirectories = ['public', 'composables', 'server', 'utils', 'stores']

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
                    const dirPath = projectDirectory(dir as DirectoryKind)
                    if (!existsSync(dirPath)) {
                        mkdirSync(dirPath, { recursive: true })
                    }

                    if (dir === 'pages') {
                        await createFile({
                            fileName: 'index.vue',
                            content: generateVueFileTemplate('page'),
                            fullPath: `${dirPath}/index.vue`,
                        })
                    }

                    if (dir === 'layouts') {
                        await createFile({
                            fileName: 'default.vue',
                            content: generateVueFileTemplate('layout'),
                            fullPath: `${dirPath}/default.vue`,
                        })
                    }
                })
            }
        })
}

/** Open the project directory checklist. */
const projectStructure = () => {
    promptDirectorySelection()
}

/** Create application configuration in appDir. */
const appConfig = () => {
    createFile({
        fileName: 'app.config.ts',
        content: appConfigContent,
        fullPath: `${projectDirectory('app')}/app.config.ts`,
    })
}

/** Create the project-root ignore file. */
const nuxtIgnore = () => {
    createFile({
        fileName: '.nuxtignore',
        content: '',
        fullPath: `${projectRootDirectory()}/.nuxtignore`,
    })
}

/** Create the project-root CLI configuration file. */
const nuxtRC = () => {
    createFile({
        fileName: '.nuxtrc',
        content: '',
        fullPath: `${projectRootDirectory()}/.nuxtrc`,
    })
}

/** Create the application’s error page from the selected template. */
const errorLayout = async () => {
    const filePath = `${await projectSrcDirectory()}/error.vue`

    await createFile({
        fileName: 'error.vue',
        content: generateVueFileTemplate('page'),
        fullPath: filePath,
    })
}

export { appConfig, errorLayout, nuxtIgnore, nuxtRC, projectStructure }
