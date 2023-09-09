import { createComponent, directCreateComponent } from './Component'
import { createPage, directCreatePage } from './Page'
import { createComposable, directCreateComposable } from './Composable'
import { createLayout, directCreateLayout } from './Layout'
import { createPlugin, directCreatePlugin } from './Plugin'
import { createMiddleware, directCreateMiddleware } from './Middleware'
import { createNitroAPI, directCreateNitroAPI, createNitroRoute, directCreateNitroRoute, createNitroPlugin, createNitroMiddleware, createNitroUtil } from './Nitro'
import { projectStructure, appConfig, nuxtIgnore, nuxtRC } from './Structure'
import { openDocumentation, openModules } from './externalLinks'
import { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtBuildModule, nuxtAnalyze, nuxtInfo, } from './TerminalCommands'
import { createStore, directCreateStore } from './Store'
import { installDependencies, searchAndInstallDependencies } from './InstallDependencies'
import { openSettings } from '../utils/navigation'
import { upgradePackage, managePackageVersion } from '../utils/dependency'
import { configureCSS } from './CSS'
import { configureLinters } from './Linters'
import { createPageTemplate, createLayoutTemplate, createFileFromTemplate, createEmptyFileTemplate } from './FileTemplates'
import { nuxtConfigWatcher, directToggleDevTools } from './Devtools'
import { createUtil, directCreateUtil } from './Util'


const commands = {
    createComponent,
    directCreateComponent,
    createPage,
    directCreatePage,
    createComposable,
    directCreateComposable,
    createLayout,
    directCreateLayout,
    createPlugin,
    directCreatePlugin,
    createMiddleware,
    directCreateMiddleware,
    createNitroAPI,
    createNitroRoute,
    directCreateNitroAPI,
    directCreateNitroRoute,
    createNitroPlugin,
    createNitroMiddleware,
    createUtil,
    createNitroUtil,
    directCreateUtil,
    projectStructure,
    openDocumentation,
    openModules,
    nuxtDev,
    nuxtBuild,
    nuxtGenerate,
    nuxtCleanUp,
    nuxtBuildModule,
    nuxtAnalyze,
    nuxtInfo,
    createStore,
    directCreateStore,
    appConfig,
    nuxtIgnore,
    nuxtRC,
    installDependencies,
    upgradePackage,
    managePackageVersion,
    openSettings,
    configureCSS,
    configureLinters,
    createPageTemplate,
    createLayoutTemplate,
    searchAndInstallDependencies,
    createFileFromTemplate,
    createEmptyFileTemplate,
    directToggleDevTools,
    nuxtConfigWatcher
}

export default commands
