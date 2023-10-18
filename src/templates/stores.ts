import { capitalize } from "string-ts"

const piniaOptionsContent = (name: string): string => {
    return `import { defineStore } from 'pinia'

export const useMy${capitalize(name)}Store = defineStore({
  id: 'my${capitalize(name)}Store',
  state: () => ({ }),
  actions: {}
})
`}

const piniaSetupContent = (name: string): string => {
    return `import { defineStore } from 'pinia'

export const use${capitalize(name)}Store = defineStore('${name}', () => {
  return {}
})
`}


const vuexContent = `export const state = () => ({ })

export const mutations = {}

export const actions = { }
`

// piniaContent,

export {
    piniaOptionsContent,
    piniaSetupContent,
    vuexContent,
}