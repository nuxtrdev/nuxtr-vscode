import { ThemeIcon, QuickPickItem, window } from 'vscode';
import { newTerminal, projectRootDirectory, jiti, detectPackageManagerByName } from '../../utils';
import { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtInfo } from './commonCommands';
import { showNuxtModules } from './moduleCommands';

const pm = detectPackageManagerByName();
const runCommand = pm ? pm.runCommand : 'npx';

enum CLICommandDescription {
    add = "Create a new template file",
    analyze = "Build nuxt and analyze production bundle (experimental)",
    "build-module" = "Helper command for using @nuxt/module-builder",
    build = "Build nuxt for production deployment",
    cleanup = "Cleanup generated nuxt files and caches",
    _dev = "Run nuxt development server (internal command to start child process)",
    dev = "Run nuxt development server",
    devtools = "Enable or disable devtools in a Nuxt project",
    generate = "Build Nuxt and prerender all routes",
    info = "Get information about nuxt project",
    init = "Initialize a fresh project",
    module = "Manage Nuxt Modules",
    prepare = "Prepare nuxt for development/build",
    preview = "Launches nitro server for local testing after nuxi build",
    start = "Launches nitro server for local testing after nuxi build",
    test = "Run tests",
    typecheck = "Runs vue-tsc to check types throughout your app",
    upgrade = "Upgrade nuxt"
}

const directlyExecutableCommands = ['dev', 'build', 'generate', 'cleanup', 'analyze', 'build-module', 'info', 'test', 'typecheck', 'preview', 'prepare'];
const indirectlyExecutableCommands = ['module'];
const moduleCommands = ['build-module']
const internalCommands = ['_dev']

const shouldDirectlyRun = (command: any) => directlyExecutableCommands.includes(command);
const shouldIndirectlyRun = (command: any) => indirectlyExecutableCommands.includes(command);

const showCLICommands = async () => {
    const { main } = jiti("nuxi-edge");
    const commands = Object.keys(main.subCommands);

    const options = {
        placeHolder: 'Select a command',
    };

    type CLICommandDescription = {
        [key: string]: string;
    }

    const items =
        commands
            .filter((command) => !moduleCommands.includes(command))
            .filter((command) => !internalCommands.includes(command))
            .map((command) => {
                const description: CLICommandDescription = CLICommandDescription;
                const item: QuickPickItem = {
                    label: command.charAt(0).toUpperCase() + command.slice(1),
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
                await showNuxtModules();
            }
        } else {
            window.showInformationMessage(`Command ${command} is not supported yet`);
        }
    });
};


export { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtInfo, showCLICommands }
