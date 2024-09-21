import { capitalize } from 'string-ts';
import { QuickPickItem, ThemeIcon, window } from 'vscode';
import { detectPackageManagerByName, newTerminal, projectRootDirectory } from '../../utils';
import { tryImportNuxi } from '../../nuxi';
import { handleAddCommand, handleDevtoolsCommand, handleModuleCommand } from './multiStepCommands';

const pm = detectPackageManagerByName();
const runCommand = pm ? pm.runCommand : 'npx';

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

const shouldDirectlyRun = (command: any) => directlyExecutableCommands.has(command);
const shouldIndirectlyRun = (command: any) => indirectlyExecutableCommands.has(command);

const showCLICommands = async () => {
    const nuxi = await tryImportNuxi()
    if (!nuxi) {
        console.log('nuxi not found')
        return
    }
    const commands = Object.keys(nuxi.main.subCommands);

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
            newTerminal(terminalName, `${runCommand} nuxi ${command.toLowerCase()}`, `${projectRootDirectory()}`);
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
