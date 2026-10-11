/** Launch common public Nuxt CLI actions from the current project, never a bundled nightly CLI. */
import { newTerminal, projectRootDirectory } from '../../utils';
import { nuxtCLICommand } from '../../nuxi';


/** Open a terminal for a documented command using the project's installed Nuxt executable. */
function launch (command: string) {
    newTerminal(`Nuxt: ${command}`, nuxtCLICommand([command]), projectRootDirectory());
}
/** Start the Nuxt development server. */
export const nuxtDev = () => launch('dev');
/** Build the Nuxt application for production. */
export const nuxtBuild = () => launch('build');
/** Prerender the application's static routes. */
export const nuxtGenerate = () => launch('generate');
/** Remove generated Nuxt files and caches. */
export const nuxtCleanUp = () => launch('cleanup');
/** Build and inspect the application's bundle. */
export const nuxtAnalyze = () => launch('analyze');
/** Print project and Nuxt environment information. */
export const nuxtInfo = () => launch('info');
/** Prompt for a module to add through the Nuxt CLI. */


export { handleModuleCommand as nuxtModule } from './multiStepCommands';