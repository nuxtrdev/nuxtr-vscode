import {
    getNonce,
    getUri,
    projectRootDirectory,
    openExternalLink,
    getConfiguration,
    newTerminal,
    runCommand,
    projectSrcDirectory,
} from './global'

import {
    addNuxtModule,
    removeNuxtModule,
    getNuxtVersion,
    isNuxtTwo,
    hasSrcDir,
    hasServerDir,
    updateNuxtConfig,
    findNuxtConfig,
    isNuxtProject,
    scanNuxtDirectories,
} from './nuxt'

import {
    getProjectDependencies,
    getProjectScripts,
    areDependenciesInstalled,
    detectPackageManagerByName,
    getInstallationCommand,
    getOutdatedPackages,
    dependenciesUpdatesHandler,
    updateDependencies
} from './dependency'

import { createDirectoryAndFile, createFile, createSubFolders, showSubFolderQuickPick, createDir, createVueTemplate } from './file'

import { getCommandType } from './commands'

import { logger } from './outputChannel'

import { languageSelector, patternSelector } from './vscode';

import { generateVueFileBasicTemplate, generateVueFileTemplate } from './vueFiles'

import { removePackage, managePackageVersion } from './dependency'

export {
    openExternalLink,
    getProjectDependencies,
    getProjectScripts,
    getNuxtVersion,
    isNuxtTwo,
    hasSrcDir,
    hasServerDir,
    updateNuxtConfig,
    createDirectoryAndFile,
    projectSrcDirectory,
    projectRootDirectory,
    createSubFolders,
    showSubFolderQuickPick,
    getConfiguration,
    createFile,
    createVueTemplate,
    areDependenciesInstalled,
    detectPackageManagerByName,
    getInstallationCommand,
    getOutdatedPackages,
    dependenciesUpdatesHandler,
    generateVueFileBasicTemplate,
    generateVueFileTemplate,
    updateDependencies,
    newTerminal,
    getNonce,
    getUri,
    addNuxtModule,
    removeNuxtModule,
    runCommand,
    logger,
    createDir,
    findNuxtConfig,
    isNuxtProject,
    getCommandType,
    scanNuxtDirectories,
    languageSelector,
    patternSelector,
    removePackage,
    managePackageVersion
}
