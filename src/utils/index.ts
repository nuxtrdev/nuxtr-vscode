export {
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

export {
    removeNuxtModule,
    getNuxtVersion,
    isNuxtTwo,
    hasServerDir,
    findNuxtConfig,
    isNuxtProject,
    isModuleConfigured,
    updateNuxtConfig
} from './nuxt'

export {
    getProjectDependencies,
    getProjectScripts,
    detectPackageManagerByName,
    getInstallationCommand,
    getOutdatedPackages,
    dependenciesUpdatesHandler,
    updateDependencies,
    isDependencyInstalled,
    removePackage,
    managePackageVersion
} from './dependency'

export {
    createFile,
    createSubFolders,
    showSubFolderQuickPick,
    createDir,
    createVueTemplate,
    normalizeName,
    normalizeFileExtension
} from './file'

export { logger } from './outputChannel'
export { createConfigWatcher } from './watchers'
export { injectPkgJSONScript } from './pkgJSON'

export {
    languageSelector,
    patternSelector,
    isDirectory,
    openFolder,
    quickOpenButtons
} from './vscode';

export {
    generateVueFileBasicTemplate,
    generateVueFileTemplate,
    generatePiniaTemplates
} from './files'
