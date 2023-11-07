import { getNonce, getUri, projectRootDirectory, openExternalLink, getConfiguration, newTerminal, runCommand, projectSrcDirectory, tryImport } from './global'

import {
    addNuxtModule,
    removeNuxtModule,
    getNuxtVersion,
    isNuxtTwo,
    hasSrcDir,
    fetchNuxtAlias,
    hasServerDir,
    updateNuxtConfig,
    findNuxtConfig,
    isNuxtProject,
    scanNuxtDirectories,
    isNuxiInstalled
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

import { createDirectoryAndFile, createFile, createSubFolders, showSubFolderQuickPick, createDir, createVueTemplate, normalizeName } from './file'

import { getCommandType } from './commands'

import { logger } from './outputChannel'

import { languageSelector, patternSelector, pathExists, isDirectory, readDirectory } from './vscode';

import { generateVueFileBasicTemplate, generateVueFileTemplate, generatePiniaTemplates } from './files'

import { removePackage, managePackageVersion } from './dependency'

import { createConfigWatcher } from './watchers'

export {
    openExternalLink,
    getProjectDependencies,
    getProjectScripts,
    tryImport,
    getNuxtVersion,
    isNuxtTwo,
    hasSrcDir,
    hasServerDir,
    fetchNuxtAlias,
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
    generatePiniaTemplates,
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
    pathExists,
    isDirectory,
    readDirectory,
    removePackage,
    managePackageVersion,
    createConfigWatcher,
    isNuxiInstalled,
    normalizeName
}
