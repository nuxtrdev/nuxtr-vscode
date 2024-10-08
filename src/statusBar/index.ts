import { ExtensionContext, StatusBarAlignment, StatusBarItem, ThemeColor, commands, window } from 'vscode';
import { directToggleDevTools, nuxtDevToolsHandler } from '../commands/devtools';
import { dependenciesUpdatesHandler } from '../utils';

export const statusBars: NuxtrStatusBars = {
    devToolsStatusBar: window.createStatusBarItem(StatusBarAlignment.Right, 100),
    updatesStatusBar: window.createStatusBarItem(StatusBarAlignment.Right, 200),
};
interface NuxtrStatusBars {
    devToolsStatusBar: StatusBarItem;
    updatesStatusBar: StatusBarItem;
}

interface DevtoolsStatusBar {
    command: string;
    tooltip: string;
    text: string;
    color?: ThemeColor;
}

export function activateStatusBarIcons (context: ExtensionContext): NuxtrStatusBars {
    statusBars.devToolsStatusBar.name = 'Nuxtr';
    statusBars.devToolsStatusBar.text = '$(loading~spin)';
    statusBars.devToolsStatusBar.show();

    nuxtDevToolsHandler();

    statusBars.updatesStatusBar.name = 'Nuxtr';
    statusBars.updatesStatusBar.text = '$(loading~spin)';
    statusBars.updatesStatusBar.show();
    dependenciesUpdatesHandler(statusBars.updatesStatusBar);

    // directToggleDevTools
    context.subscriptions.push(
        commands.registerCommand('nuxtr.directToggleDevTools', async () => {
            await directToggleDevTools();
        })
    );
    return statusBars;
}

export function updateDevtoolsStatusBar (statusBar: DevtoolsStatusBar) {
    statusBars.devToolsStatusBar.command = statusBar.command;
    statusBars.devToolsStatusBar.tooltip = statusBar.tooltip;
    statusBars.devToolsStatusBar.text = statusBar.text;
    statusBars.devToolsStatusBar.color = statusBar.color;
}

export function hideDevtoolsStatusBar () {
    statusBars.devToolsStatusBar.hide()
}