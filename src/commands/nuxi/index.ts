/** Present documented Nuxt CLI commands without importing private CLI implementation details. */
import { capitalize } from 'string-ts';
import { QuickPickItem, ThemeIcon, window } from 'vscode';
import { newTerminal, projectRootDirectory } from '../../utils';
import { nuxtCLICommand } from '../../nuxi';
import { handleAddCommand, handleDevtoolsCommand, handleModuleCommand } from './multiStepCommands';


enum CLICommandDescription {
    add = 'Create a new template file',
    analyze = 'Build nuxt and analyze production bundle (experimental)',
    'build-module' = 'Helper command for using @nuxt/module-builder',
    build = 'Build nuxt for production deployment',
    cleanup = 'Cleanup generated nuxt files and caches',
    _dev = 'Run nuxt development server (internal command to start child process)',
    dev = 'Run nuxt development server',
    devtools = 'Enable or disable devtools in a Nuxt project',
    generate = 'Build Nuxt and prerender all routes',
    info = 'Get information about nuxt project',
    init = 'Initialize a fresh project',
    module = 'Manage Nuxt Modules',
    prepare = 'Prepare nuxt for development/build',
    preview = 'Launches nitro server for local testing after nuxi build',
    start = 'Launches nitro server for local testing after nuxi build',
    test = 'Run tests',
    typecheck = 'Runs vue-tsc to check types throughout your app',
    upgrade = 'Upgrade nuxt'
}

const directlyExecutableCommands = new Set([ 'dev', 'build', 'generate', 'cleanup', 'analyze', 'build-module', 'info', 'typecheck', 'preview', 'prepare', 'upgrade', 'start', 'test' ]);
const indirectlyExecutableCommands = new Set(['module', 'add', 'devtools']);
const unsupportedCommands = new Set(['init']);
const moduleCommands = new Set(['build-module'])
const internalCommands = new Set(['_dev'])

/** Tell whether a documented command can run without additional prompts. */
const shouldDirectlyRun = (command: string) => directlyExecutableCommands.has(command);
/** Tell whether a documented command needs a Nuxtr prompt. */
const shouldIndirectlyRun = (command: string) => indirectlyExecutableCommands.has(command);

/** Show supported public CLI commands and launch the project-local executable. */
const showCLICommands = () => {
    const commands = [...directlyExecutableCommands, ...indirectlyExecutableCommands];

    const options = {
        placeHolder: 'Select a command',
    };

    type CLICommandDescription = {
        [key: string]: string;
    }

    const items =
        commands
            .filter((command) => !moduleCommands.has(command))
            .filter((command) => !internalCommands.has(command))
            .filter((command) => !unsupportedCommands.has(command))
            .map((command) => {
                const description: CLICommandDescription = CLICommandDescription;
                const item: QuickPickItem = {
                    label: capitalize(command),
                    description: description[command],
                    iconPath: new ThemeIcon('nuxt-logo'),
                };

                return item;
            });

    window.showQuickPick(items, options).then(async (selection) => {
        if (!selection) {
            return;
        }

        const command = selection.label;

        if (shouldDirectlyRun(selection.label.toLowerCase())) {
            const terminalName = `Nuxi: ${command}`;
            newTerminal(terminalName, nuxtCLICommand([command.toLowerCase()]), `${projectRootDirectory()}`);
        } else if (shouldIndirectlyRun(command.toLowerCase())) {
            if (command.toLowerCase() === 'module') {
                await handleModuleCommand();
            }

            if (command.toLowerCase() === 'add') {
                await handleAddCommand();
            }

            if (command.toLowerCase() === 'devtools') {
                handleDevtoolsCommand()
            }

        } else {
            window.showInformationMessage(`Command ${command} is not supported yet`);
        }
    });
};


export { showCLICommands };

export { nuxtAnalyze, nuxtBuild, nuxtCleanUp, nuxtDev, nuxtGenerate, nuxtInfo, nuxtModule } from './commonCommands';
