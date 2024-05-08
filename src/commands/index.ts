import { createComponent, directCreateComponent } from './Component'
import { createPage, directCreatePage } from './Page'
import { createComposable, directCreateComposable } from './Composable'
import { createLayout, directCreateLayout } from './Layout'
import { createPlugin, directCreatePlugin } from './Plugin'
import { createMiddleware, directCreateMiddleware } from './Middleware'
import { createNitroAPI, createNitroMiddleware, createNitroPlugin, createNitroRoute, createNitroUtil, directCreateNitroAPI, directCreateNitroRoute } from './Nitro'
import { appConfig, errorLayout, nuxtIgnore, nuxtRC, projectStructure } from './Structure'
import { openDocumentation, openModules } from './externalLinks'
import { nuxtAnalyze, nuxtBuild, nuxtCleanUp, nuxtDev, nuxtGenerate, nuxtInfo, nuxtModule, showCLICommands } from './Nuxi'
import { createStore, directCreateStore } from './Store'
import { installDependencies } from './InstallDependencies'
import { openSettings } from '../utils/navigation'
import { managePackageVersion, upgradePackage } from '../utils/dependency'
import { configureCSS } from './CSS'
import { configureLinters } from './Linters'
import { configurePug } from './Templates'
import { createEmptyFileTemplate, createFileFromTemplate, createLayoutTemplate, createPageTemplate } from './FileTemplates'
import { directToggleDevTools, nuxtConfigWatcher } from './Devtools'
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
