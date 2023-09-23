import { QuickPickItem, window, QuickPickOptions } from 'vscode';
import { newTerminal, detectPackageManagerByName, projectRootDirectory } from '../../utils';
import type { nuxtModule } from '../../types';
import axios from 'axios';

const pm = detectPackageManagerByName();
const runCommand = pm ? pm.runCommand : 'npx';


const fetchModules = async () => {
    let res = await axios.get('https://nuxt.com/api/modules');
    return res.data.modules;
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

    const template = window.showQuickPick(items, options).then((selection) => {
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

            const terminalName = `Nuxi: Add`;
            const command = `nuxi add ${template} ${templateName}`;
            newTerminal(terminalName, command, `${projectRootDirectory()}`);
        });
    })

}


export const handleModuleCommand = async () => {
    const modules: nuxtModule[] = await fetchModules();

    if (!Array.isArray(modules)) {
        window.showErrorMessage('Error fetching Nuxt modules');
    } else {
        const options: QuickPickOptions = {
            placeHolder: 'Select module(s)',
            canPickMany: true
        };

        const items = modules.map((module) => {
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

            Array.isArray(selection) ?
                userSelection = selection.map((module) => module.label).join(' ')
                : userSelection = selection.label;

            const terminalName = `Nuxi: Module`;
            const command = `${runCommand} nuxi module add ${userSelection}`;
            newTerminal(terminalName, command, `${projectRootDirectory()}`);
        });
    }
};

export const handleDevtoolsCommand = async () => {
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

    const state = window.showQuickPick(items, options).then((selection) => {
        if (!selection) {
            return;
        }

        const state = selection.label;
        const terminalName = `Nuxi: Devtools`;
        const command = `nuxi devtools ${state}`;
        newTerminal(terminalName, command, `${projectRootDirectory()}`);
    })

}