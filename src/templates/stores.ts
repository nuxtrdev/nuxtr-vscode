/** Generate Pinia options/setup stores and the existing Nuxt 2 Vuex scaffold. */
import { normalizedIdentifier as normalizeName, piniaOptionsTemplate } from '../core/generated';

/** Generate the supported Pinia options-store signature with an explicit Pinia import. */
const piniaOptionsContent = piniaOptionsTemplate;

/** Generate a compositional Pinia setup store with a documented exported factory. */
const piniaSetupContent = (name: string): string => {
    return `/** Setup store for ${normalizeName(name)}. */
import { defineStore } from 'pinia'

/** Access the store’s reactive state and actions. */
export const use${normalizeName(name)}Store = defineStore('${normalizeName(name)}', () => {
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