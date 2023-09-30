const piniaContent = (name: string) => {
    return `import { defineStore } from 'pinia'

export const useMy${name.charAt(0).toUpperCase() + name.slice(1)}Store = defineStore({
  id: 'my${name.charAt(0).toUpperCase() + name.slice(1)}Store',
  state: () => ({ }),
  actions: {},
})
`}

const vuexContent = `export const state = () => ({ })

export const mutations = {}

export const actions = { }
`

const appConfigContent = `export default defineAppConfig({

})
`

export {
    piniaContent,
    vuexContent,
    appConfigContent
}