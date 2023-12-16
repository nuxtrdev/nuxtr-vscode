import { createComponent, directCreateComponent } from './Component'
import { createPage, directCreatePage } from './Page'
import { createComposable, directCreateComposable } from './Composable'
import { createLayout, directCreateLayout } from './Layout'
import { createPlugin, directCreatePlugin } from './Plugin'
import { createMiddleware, directCreateMiddleware } from './Middleware'
import { createNitroAPI, directCreateNitroAPI, createNitroRoute, directCreateNitroRoute, createNitroPlugin, createNitroMiddleware, createNitroUtil } from './Nitro'
import { projectStructure, appConfig, nuxtIgnore, nuxtRC, errorLayout } from './Structure'
import { openDocumentation, openModules } from './externalLinks'
import { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtInfo, nuxtModule, showCLICommands } from './Nuxi'
import { createStore, directCreateStore } from './Store'
import { installDependencies } from './InstallDependencies'
import { openSettings } from '../utils/navigation'
import { upgradePackage, managePackageVersion } from '../utils/dependency'
import { configureCSS } from './CSS'
import { configureLinters } from './Linters'
import { configurePug } from './Templates'
import { createPageTemplate, createLayoutTemplate, createFileFromTemplate, createEmptyFileTemplate } from './FileTemplates'
import { nuxtConfigWatcher, directToggleDevTools } from './Devtools'
import { createUtil, directCreateUtil } from './Util'
import { createProject } from './Project'


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
