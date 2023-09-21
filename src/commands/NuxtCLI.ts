import { ThemeIcon, QuickInputButton, QuickPickItem, window } from 'vscode';
import { newTerminal, projectRootDirectory, jiti, detectPackageManagerByName } from '../utils';

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
const moduleCommands = ['build-module']
const internalCommands = ['_dev']

const shouldDirectlyRun = (command: any) => directlyExecutableCommands.includes(command);


const nuxtDev = () => newTerminal('Dev', 'npx nuxi dev', `${projectRootDirectory()}`)
const nuxtBuild = () => newTerminal('Build', 'npx nuxi build', `${projectRootDirectory()}`)
const nuxtGenerate = () => newTerminal('Build', 'npx nuxi generate', `${projectRootDirectory()}`)
const nuxtCleanUp = () => newTerminal('Clean Up', 'npx nuxi clean', `${projectRootDirectory()}`)
const nuxtAnalyze = () => newTerminal('Analyze', 'npx nuxi analyze', `${projectRootDirectory()}`)
const nuxtBuildModule = () => newTerminal('Build Modules', 'npx nuxi buildModule', `${projectRootDirectory()}`)
const nuxtInfo = () => newTerminal('Info', 'npx nuxi info', `${projectRootDirectory()}`)

const github: QuickInputButton = {
    iconPath: new ThemeIcon('github'),
    tooltip: 'GitHub',
};

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
                const item: QuickPickItem  = {
                    label: command.charAt(0).toUpperCase() + command.slice(1),
                    description: description[command],
                    iconPath: new ThemeIcon('nuxt-logo'),
                };

                item.buttons = [github];

                return item;
            });

    const pm = await detectPackageManagerByName();
    const rumCommand = pm ? pm.runCommand : 'npx';

    window.showQuickPick(items, options).then((selection) => {
        if (!selection) {
            return;
        }

        if (shouldDirectlyRun(selection.label.toLowerCase())) {
            const command = selection.label;
            const terminalName = `Nuxi: ${command.toLowerCase()}`;
            newTerminal(terminalName, `${rumCommand} nuxi ${command.toLowerCase()}`, `${projectRootDirectory()}`);
        } else {
            window.showInformationMessage('Command is not yet supported');
        }
    });
};


export { nuxtDev, nuxtBuild, nuxtGenerate, nuxtCleanUp, nuxtAnalyze, nuxtBuildModule, nuxtInfo, showCLICommands }
