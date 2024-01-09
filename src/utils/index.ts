import {
    getNonce,
    getUri,
    projectRootDirectory,
    openExternalLink,
    nuxtrConfiguration,
    vscodeConfiguration,
    newTerminal,
    runCommand,
    projectSrcDirectory,
    tryImport
} from './global'

import {
    addNuxtModule,
    removeNuxtModule,
    getNuxtVersion,
    isNuxtTwo,
    hasServerDir,
    findNuxtConfig,
    isNuxtProject,
} from './nuxt'

import {
    getProjectDependencies,
    getProjectScripts,
    detectPackageManagerByName,
    getInstallationCommand,
    getOutdatedPackages,
    dependenciesUpdatesHandler,
    updateDependencies
} from './dependency'

import { createFile, createSubFolders, showSubFolderQuickPick, createDir, createVueTemplate, normalizeName, normalizeFileExtension } from './file'

import { logger } from './outputChannel'

import { languageSelector, patternSelector, isDirectory, openFolder, quickOpenButtons } from './vscode';

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
    hasServerDir,
    projectSrcDirectory,
    projectRootDirectory,
    createSubFolders,
    showSubFolderQuickPick,
    nuxtrConfiguration,
    vscodeConfiguration,
    createFile,
    createVueTemplate,
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
    languageSelector,
    patternSelector,
    isDirectory,
    removePackage,
    managePackageVersion,
    createConfigWatcher,
    normalizeName,
    normalizeFileExtension,
    openFolder,
    quickOpenButtons,
}
