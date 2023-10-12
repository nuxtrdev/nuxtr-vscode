import { newTerminal, projectRootDirectory, detectPackageManagerByName } from '../../utils';
import { handleModuleCommand } from './multiStepCommands';

const pm = detectPackageManagerByName();
const runCommand = pm ? pm.runCommand : 'npx';

const nuxtDev = () => newTerminal('Nuxi: Dev', `${runCommand} nuxi dev`, `${projectRootDirectory()}`)
const nuxtBuild = () => newTerminal('Nuxi: Build', `${runCommand} nuxi build`, `${projectRootDirectory()}`)
const nuxtGenerate = () => newTerminal('Nuxi: Build', `${runCommand} nuxi generate`, `${projectRootDirectory()}`)
const nuxtCleanUp = () => newTerminal('Nuxi: Cleanup', `${runCommand} nuxi cleanup`, `${projectRootDirectory()}`)
const nuxtAnalyze = () => newTerminal('Nuxi: Analyze', `${runCommand} nuxi analyze`, `${projectRootDirectory()}`)
const nuxtInfo = () => newTerminal('Nuxi: Info', `${runCommand} nuxi info`, `${projectRootDirectory()}`)
const nuxtModule = async () => await handleModuleCommand()

export { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtInfo, nuxtModule }