import { newTerminal, projectRootDirectory } from '../utils'
const nuxtDev = () => newTerminal('Nuxt: Dev', 'npx nuxi dev', `${projectRootDirectory()}`)
const nuxtBuild = () => newTerminal('Nuxt: Build', 'npx nuxi build', `${projectRootDirectory()}`)
const nuxtGenerate = () => newTerminal('Nuxt: Build', 'npx nuxi generate', `${projectRootDirectory()}`)
const nuxtCleanUp = () => newTerminal('Nuxt: Clean Up', 'npx nuxi clean', `${projectRootDirectory()}`)
const nuxtAnalyze = () => newTerminal('Nuxt: Analyze', 'npx nuxi analyze', `${projectRootDirectory()}`)
const nuxtBuildModule = () => newTerminal('Nuxt: Build Modules', 'npx nuxi buildModule', `${projectRootDirectory()}`)
const nuxtInfo = () => newTerminal('Nuxt: Info', 'npx nuxi info', `${projectRootDirectory()}`)

export { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtBuildModule, nuxtInfo }
