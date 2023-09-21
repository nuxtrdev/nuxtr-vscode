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

export const showNuxtModules = async () => {
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