import { capitalize } from "string-ts"

const piniaContent = (name: string) => {
    return `import { defineStore } from 'pinia'

export const useMy${capitalize(name)}Store = defineStore({
  id: 'my${capitalize(name)}Store',
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