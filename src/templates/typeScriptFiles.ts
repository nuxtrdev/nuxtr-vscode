import { normalizeName } from '../utils'

const nitroDefaultTemplate = `export default defineEventHandler(async (event) => {
  return 'Hello Nitro'
})
`

const nuxtMiddlewareTemplate = `export default defineNuxtRouteMiddleware((to, from) => {

})
`

const composableTemplate = (name: string) => `export const use${normalizeName(name)} = () => {
  return ref()
}
`

const nuxtPluginTemplate = `export default defineNuxtPlugin((nuxtApp) => {

})
`

const nitroPluginTemplate = `export default defineNitroPlugin((nitroApp) => {

})
`

const nuxtUtilTemplate = () => `export default () => {
  return 'Hello Util'
}
`

const nitroUtilTemplate = `export default () => {
  return 'Hello Util'
}`

const appConfigContent = `export default defineAppConfig({

})
`


export {
    nitroDefaultTemplate,
    nuxtMiddlewareTemplate,
    composableTemplate,
    nuxtPluginTemplate,
    nitroPluginTemplate,
    nuxtUtilTemplate,
    nitroUtilTemplate,
    appConfigContent
}