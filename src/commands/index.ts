import { managePackageVersion, upgradePackage } from '../utils/dependency'
import { openSettings } from '../utils/navigation'
import { createComponent, directCreateComponent } from './component'
import { createComposable, directCreateComposable } from './composable'
import { configureCSS } from './css'
import { directToggleDevTools, nuxtConfigWatcher } from './devtools'
import { openDocumentation, openModules } from './externalLinks'
import { createEmptyFileTemplate, createFileFromTemplate, createLayoutTemplate, createPageTemplate } from './fileTemplates'
import { installDependencies } from './installDependencies'
import { createLayout, directCreateLayout } from './layout'
import { configureLinters } from './linters'
import { createMiddleware, directCreateMiddleware } from './middleware'
import { createNitroAPI, createNitroMiddleware, createNitroPlugin, createNitroRoute, createNitroUtil, directCreateNitroAPI, directCreateNitroRoute } from './nitro'
import { nuxtAnalyze, nuxtBuild, nuxtCleanUp, nuxtDev, nuxtGenerate, nuxtInfo, nuxtModule, showCLICommands } from './nuxi'
import { createPage, directCreatePage } from './page'
import { createPlugin, directCreatePlugin } from './plugin'
import { createProject } from './project'
import { createStore, directCreateStore } from './store'
import { appConfig, errorLayout, nuxtIgnore, nuxtRC, projectStructure } from './structure'
import { configurePug } from './templates'
import { createUtil, directCreateUtil } from './util'


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
    createProject,
    projectStructure,
    openDocumentation,
    openModules,
    nuxtDev,
    nuxtBuild,
    nuxtGenerate,
    nuxtCleanUp,
    nuxtAnalyze,
    nuxtInfo,
    nuxtModule,
    showCLICommands,
    createStore,
    directCreateStore,
    appConfig,
    nuxtIgnore,
    nuxtRC,
    errorLayout,
    installDependencies,
    upgradePackage,
    managePackageVersion,
    openSettings,
    configureCSS,
    configureLinters,
    configurePug,
    createPageTemplate,
    createLayoutTemplate,
    createFileFromTemplate,
    createEmptyFileTemplate,
    directToggleDevTools,
    nuxtConfigWatcher
}

export default commands
