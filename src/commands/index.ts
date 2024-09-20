import { managePackageVersion, upgradePackage } from '../utils/dependency'
import { openSettings } from '../utils/navigation'
import { configureCSS } from './CSS'
import { createComponent, directCreateComponent } from './Component'
import { createComposable, directCreateComposable } from './Composable'
import { directToggleDevTools, nuxtConfigWatcher } from './Devtools'
import { createEmptyFileTemplate, createFileFromTemplate, createLayoutTemplate, createPageTemplate } from './FileTemplates'
import { installDependencies } from './InstallDependencies'
import { createLayout, directCreateLayout } from './Layout'
import { configureLinters } from './Linters'
import { createMiddleware, directCreateMiddleware } from './Middleware'
import { createNitroAPI, createNitroMiddleware, createNitroPlugin, createNitroRoute, createNitroUtil, directCreateNitroAPI, directCreateNitroRoute } from './Nitro'
import { nuxtAnalyze, nuxtBuild, nuxtCleanUp, nuxtDev, nuxtGenerate, nuxtInfo, nuxtModule, showCLICommands } from './Nuxi'
import { createPage, directCreatePage } from './Page'
import { createPlugin, directCreatePlugin } from './Plugin'
import { createProject } from './Project'
import { createStore, directCreateStore } from './Store'
import { appConfig, errorLayout, nuxtIgnore, nuxtRC, projectStructure } from './Structure'
import { configurePug } from './Templates'
import { createUtil, directCreateUtil } from './Util'
import { generateBugInfoReport } from './bugReport'
import { openDocumentation, openModules } from './externalLinks'

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
    nuxtConfigWatcher,
    generateBugInfoReport
}

export default commands
