function capitalizeFirstLettee(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1)
        .replace(/\/([a-z])/g, (g) => g[1].toUpperCase())
}

export const nitroDefaultTemplate = `export default defineEventHandler(async (event) => {
  return 'Hello Nitro'
})
`

export const nuxtMiddlewareTemplate = `export default defineNuxtRouteMiddleware((to, from) => {

})
`

export const composableTemplate = (name: string) => `export const use${capitalizeFirstLettee(
    name
)} = () => {
  return ref()
}
`

export const nuxtPluginTemplate = `export default defineNuxtPlugin((nuxtApp) => {

})
`

export const nitroPluginTemplate = `export default defineNitroPlugin((nitroApp) => {

})
`