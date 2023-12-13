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

const nuxtUtilTemplate = (name: string) => `export default () => {
  return 'Hello Util'
}
`

const nitroUtilTemplate = `import type { EventHandler, EventHandlerRequest } from 'h3'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D> (
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
    defineEventHandler<T>(async (event) => {
      try {
        const response = await handler(event)
        return { response }
      } catch (err) {
      // Error handling
        return { err }
      }
    })
`


export {
    nitroDefaultTemplate,
    nuxtMiddlewareTemplate,
    composableTemplate,
    nuxtPluginTemplate,
    nitroPluginTemplate,
    nuxtUtilTemplate,
    nitroUtilTemplate
}