function capitalizeFirstLettee(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1)
        .replace(/\/([a-z])/g, (g) => g[1].toUpperCase())
}

export const apiTemplate = (name: string) => `export default defineEventHandler(async (event) => {
  return 'Hello ${name}'
})
`

export const middlewareTemplate = `export default defineNuxtRouteMiddleware((to, from) => {})
`

export const composableTemplate = (name: string) => `export const use${capitalizeFirstLettee(
    name
)} = () => {
  return ref()
}
`

export const pluginTemplate = `export default defineNuxtPlugin((nuxtApp) => {})`
