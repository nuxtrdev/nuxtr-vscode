import { eslintConfig, stylelintConfig, stylelintIgnore, eslintIgnore } from './linters'
import { unoCSSConfig, windiCSSConfig, tailwindCSSJSConfig, tailwindCSSTSConfig, tailwindCSSFile, vuetifyConfigFile } from './css'
import {
    nitroDefaultTemplate,
    nuxtMiddlewareTemplate,
    composableTemplate,
    nuxtPluginTemplate,
    nitroPluginTemplate,
    nuxtUtilTemplate,
    nitroUtilTemplate
} from './typeScriptFiles'
import { generateStyleTag, generateScriptTag, templateTag } from './vueFiles'
import { vuexContent, piniaOptionsContent, piniaSetupContent } from './stores'
import { appConfigContent } from './appConfig'


export {
    unoCSSConfig,
    windiCSSConfig,
    tailwindCSSJSConfig,
    tailwindCSSTSConfig,
    tailwindCSSFile,
    vuetifyConfigFile,
    eslintConfig,
    stylelintConfig,
    stylelintIgnore,
    eslintIgnore,
    nitroDefaultTemplate,
    nuxtMiddlewareTemplate,
    composableTemplate,
    nuxtPluginTemplate,
    nitroPluginTemplate,
    nuxtUtilTemplate,
    nitroUtilTemplate,
    generateStyleTag,
    generateScriptTag,
    templateTag,
    vuexContent,
    piniaOptionsContent,
    piniaSetupContent,
    appConfigContent
}