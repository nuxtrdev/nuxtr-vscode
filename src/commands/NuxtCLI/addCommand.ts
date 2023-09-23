import { QuickPickItem, window, QuickPickOptions } from 'vscode';
import { newTerminal, projectRootDirectory } from '../../utils';

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
