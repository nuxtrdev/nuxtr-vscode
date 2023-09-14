import { eslintConfig, stylelintConfig, stylelintIgnore, eslintIgnore } from './linters'
import { unoCSSConfig, windiCSSConfig, tailwindCSSConfig, tailwindCSSFile, vuetifyConfigFile } from './css'
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
import { vuexContent, piniaContent, appConfigContent } from './stores'


export {
    unoCSSConfig,
    windiCSSConfig,
    tailwindCSSConfig,
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
    piniaContent,
    appConfigContent
}