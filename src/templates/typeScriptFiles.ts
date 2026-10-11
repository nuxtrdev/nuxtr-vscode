/** Starter code for Nuxt/Nitro application, route, middleware, plugin and composable files. */
import { composableName } from '../core/templates';

const nitroDefaultTemplate = `/** Handle this server route and provide its response. */
export default defineEventHandler(() => {
  return 'Hello Nitro'
})
`

const nuxtMiddlewareTemplate = `export default defineNuxtRouteMiddleware((to, from) => {

})
`

/** Generate a named reactive composable with a use-prefixed exported function. */
const composableTemplate = (name: string) => `/** Reactive state shared by callers of this composable. */
export const use${composableName(name)} = () => {
  return ref()
}
`

const nuxtPluginTemplate = `export default defineNuxtPlugin((nuxtApp) => {

})
`

const nitroPluginTemplate = `export default defineNitroPlugin((nitroApp) => {

})
`

/** Generate a reusable application utility starter. */
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


export { serverMiddlewareTemplate } from '../core/generated';