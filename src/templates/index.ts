export const piniaContent = (name: string) => {
    return `
import { defineStore } from 'pinia'

export const useMy${name.charAt(0).toUpperCase() + name.slice(1)}Store = defineStore({
  id: 'my${name.charAt(0).toUpperCase() + name.slice(1)}Store',
  state: () => ({ }),
  actions: {},
})
`}

export const vuexContent = `
export const state = () => ({ })

export const mutations = {}

export const actions = { }
`

export const appConfigContent = `
export default defineAppConfig({

})
`
