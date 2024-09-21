import { ofetch } from 'ofetch';
import { QuickPickItem, QuickPickOptions, window } from 'vscode';
import type { nuxtModule } from '../../types';
import { detectPackageManagerByName, isNuxtTwo, newTerminal, projectRootDirectory } from '../../utils';


const pm = detectPackageManagerByName();
const runCommand = pm ? pm.runCommand : 'npx';


const fetchModules = async () => {
    const res = await ofetch('https://api.nuxt.com/modules');
    return res.modules;
}


export const handleAddCommand = (): void => {
    const options: QuickPickOptions = {
        placeHolder: 'Select module(s)',
        canPickMany: false
    };

    const templates = ['api', 'plugin', 'component', 'composable', 'middleware', 'layout', 'page'];

    const items = templates.map((template) => {
        const item: QuickPickItem = {
            label: template
        };

        return item;
    });

    window.showQuickPick(items, options).then((selection) => {
        if (!selection) {
            return;
        }

        const template = selection.label;

        const templateName = window.showInputBox({
            placeHolder: 'Enter the name of the template file',
            prompt: `Template name for ${template}`
        })

        templateName.then((templateName) => {
            if (!templateName) {
                return;
            }

            const terminalName = 'Nuxi: Add';
            const command = `nuxi add ${template} ${templateName}`;
            newTerminal(terminalName, command, `${projectRootDirectory()}`);
        });
    })

}


export const handleModuleCommand = async () => {
    const modules: nuxtModule[] = await fetchModules();

    if (Array.isArray(modules)) {
        const options: QuickPickOptions = {
            placeHolder: 'Select module',
            canPickMany: false
        };

        const items = modules
            .filter(module => isNuxtTwo() ? module.compatibility.nuxt.includes('2.0.0') : module.compatibility.nuxt.includes('3.0.0'))
            .map((module) => {
                const item: QuickPickItem = {
                    label: module.name,
                    description: module.description
                };

                return item;
            });

        window.showQuickPick(items, options).then((selection) => {
            if (!selection) {
                return;
            }

            let userSelection = null

            userSelection = selection.label;

            if (!userSelection) {
                return;
            }

            const terminalName = 'Nuxi: Module';
            const command = `${runCommand} nuxi module add ${userSelection}`;
            newTerminal(terminalName, command, `${projectRootDirectory()}`);
        });
    } else {
        window.showErrorMessage('Error fetching Nuxt modules');
    }
};

export const handleDevtoolsCommand = () => {
    const options: QuickPickOptions = {
        placeHolder: 'Select state',
        canPickMany: false
    };

    const commandOptions = ['enable', 'disable'];

    const items = commandOptions.map((template) => {
        const item: QuickPickItem = {
            label: template
        };

        return item;
    });

    window.showQuickPick(items, options).then((selection) => {
        if (!selection) {
            return;
        }

        const state = selection.label;
        const terminalName = 'Nuxi: Devtools';
        const command = `nuxi devtools ${state}`;
        newTerminal(terminalName, command, `${projectRootDirectory()}`);
    })

}