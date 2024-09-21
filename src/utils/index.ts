export {
    getNonce,
    getUri,
    newTerminal,
    nuxtrConfiguration,
    openExternalLink,
    projectRootDirectory,
    projectSrcDirectory,
    runCommand,
    tryImport,
    vscodeConfiguration
} from './global'

export {
    findNuxtConfig,
    getNuxtVersion,
    hasServerDir,
    isModuleConfigured,
    isNuxtProject,
    isNuxtTwo,
    removeNuxtModule,
    updateNuxtConfig
} from './nuxt'

export {
    dependenciesUpdatesHandler,
    detectPackageManagerByName,
    getInstallationCommand,
    getOutdatedPackages,
    getProjectDependencies,
    getProjectScripts,
    isDependencyInstalled,
    managePackageVersion,
    removePackage,
    updateDependencies
} from './dependency'

export {
    createDir,
    createFile,
    createSubFolders,
    createVueTemplate,
    normalizeFileExtension,
    normalizeName,
    showSubFolderQuickPick
} from './file'

export { logger } from './outputChannel'
export { injectPkgJSONScript } from './pkgJSON'
export { createConfigWatcher } from './watchers'

export { isDirectory, languageSelector, openFolder, patternSelector, quickOpenButtons } from './vscode'

export { generatePiniaTemplates, generateVueFileBasicTemplate, generateVueFileTemplate } from './files'
