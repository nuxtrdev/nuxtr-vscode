import { normalizeName } from '../utils'

const piniaOptionsContent = (name: string): string => {
    return `export const useMy${normalizeName(name)}Store = defineStore({
  id: 'my${normalizeName(name)}Store',
  state: () => ({ }),
  actions: {}
})
`}

const piniaSetupContent = (name: string): string => {
    return `export const use${normalizeName(name)}Store = defineStore('${normalizeName(name)}', () => {
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