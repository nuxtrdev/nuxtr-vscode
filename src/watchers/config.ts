import { workspace, window, commands, ConfigurationChangeEvent} from 'vscode';

export const configWatcher = workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    if (event.affectsConfiguration('nuxtr')) {
        const question = window.showInformationMessage(`Nuxtr configuration updated.`, 'Reload Window');
        question.then((answer) => {
            if (answer === 'Reload Window') {
                commands.executeCommand('workbench.action.reloadWindow');
            }
        })
    }
});
