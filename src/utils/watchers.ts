import { workspace, window, commands, ConfigurationChangeEvent, Disposable } from 'vscode';

export function createConfigWatcher(configKey: string, callback?: () => Promise<void>): Disposable {
    const watcher = workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
        if (event.affectsConfiguration(configKey)) {
            // Execute the provided callback when the configuration changes.
            if (callback && typeof callback === 'function') {
                await callback();
            }

            const question = window.showInformationMessage(
                `Nuxtr configuration updated.`,
                'Reload Window'
            );

            question.then((answer) => {
                if (answer === 'Reload Window') {
                    commands.executeCommand('workbench.action.reloadWindow');

                }
            });
        }
    });

    // Return a Disposable object that can be used to stop watching for changes.
    return watcher;
}