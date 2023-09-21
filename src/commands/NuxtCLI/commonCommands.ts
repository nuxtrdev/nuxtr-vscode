import { newTerminal, projectRootDirectory, detectPackageManagerByName } from '../../utils';

const pm = detectPackageManagerByName();
const rumCommand = pm ? pm.runCommand : 'npx';

const nuxtDev = () => newTerminal('Nuxi: Dev', `${rumCommand} nuxi dev`, `${projectRootDirectory()}`)
const nuxtBuild = () => newTerminal('Nuxi: Build', '${rumCommand} nuxi build', `${projectRootDirectory()}`)
const nuxtGenerate = () => newTerminal('Nuxi: Build', `${rumCommand} nuxi generate`, `${projectRootDirectory()}`)
const nuxtCleanUp = () => newTerminal('Nuxi: Cleanup', `${rumCommand} nuxi clean`, `${projectRootDirectory()}`)
const nuxtAnalyze = () => newTerminal('Nuxi: Analyze', `${rumCommand} nuxi analyze`, `${projectRootDirectory()}`)
const nuxtInfo = () => newTerminal('Nuxi: Info', `${rumCommand} nuxi info`, `${projectRootDirectory()}`)


export { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtInfo }