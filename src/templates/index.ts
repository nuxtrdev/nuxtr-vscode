/** Public scaffold template exports for Nuxt 2/3/4 and Nitro file commands. */
export { eslintConfig, stylelintConfig, stylelintIgnore } from './linters'

export { tailwindCSSFile, tailwindCSSJSConfig, tailwindCSSTSConfig, unoCSSConfig, vuetifyConfigFile } from './css'

export {
    appConfigContent,
    composableTemplate,
    nitroDefaultTemplate,
    serverMiddlewareTemplate,
    nitroPluginTemplate,
    nitroUtilTemplate,
    nuxtMiddlewareTemplate,
    nuxtPluginTemplate,
    nuxtUtilTemplate
} from './typeScriptFiles'

export { generateScriptTag, generateStyleTag, templateTag } from './vueFiles'

export { piniaOptionsContent, piniaSetupContent, vuexContent } from './stores'
