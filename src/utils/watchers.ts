import { ConfigurationChangeEvent, Disposable, commands, window, workspace } from 'vscode';

export function createConfigWatcher (configKey: string, callback?: () => Promise<void>, defaultBehavior?: boolean): Disposable {
    const watcher = workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
        if (event.affectsConfiguration(configKey)) {
            if (callback && typeof callback === 'function') {
                await callback();
            }

            if (defaultBehavior) {
                const question = window.showInformationMessage(
                    'Nuxtr configuration updated.',
                    'Reload Window'
                );

                question.then((answer) => {
                    if (answer === 'Reload Window') {
                        commands.executeCommand('workbench.action.reloadWindow');

                    }
                });
            }
        }
    });

    return watcher;
}