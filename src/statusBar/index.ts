/** Display and dispose project dependency and Nuxt DevTools status indicators. */
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
    color?: string | ThemeColor;
}

/** Register status actions and attach both indicators to the extension lifetime. */
export function activateStatusBarIcons (context: ExtensionContext): NuxtrStatusBars {
    context.subscriptions.push(statusBars.devToolsStatusBar, statusBars.updatesStatusBar);
    statusBars.devToolsStatusBar.name = 'Nuxtr';
    statusBars.devToolsStatusBar.text = '$(loading~spin)';
    statusBars.devToolsStatusBar.show();

    void nuxtDevToolsHandler().catch(() => { statusBars.devToolsStatusBar.hide(); });

    statusBars.updatesStatusBar.name = 'Nuxtr';
    statusBars.updatesStatusBar.text = '$(loading~spin)';
    statusBars.updatesStatusBar.show();
    void dependenciesUpdatesHandler(statusBars.updatesStatusBar).catch(() => { statusBars.updatesStatusBar.text = '$(warning)'; });

    // directToggleDevTools
    context.subscriptions.push(
        commands.registerCommand('nuxtr.directToggleDevTools', async () => {
            await directToggleDevTools();
        })
    );
    return statusBars;
}

/** Update the DevTools indicator from resolved project configuration. */
export function updateDevtoolsStatusBar (statusBar: DevtoolsStatusBar) {
    statusBars.devToolsStatusBar.command = statusBar.command;
    statusBars.devToolsStatusBar.tooltip = statusBar.tooltip;
    statusBars.devToolsStatusBar.text = statusBar.text;
    statusBars.devToolsStatusBar.color = statusBar.color;
}

/** Hide DevTools for project versions that do not support it. */
export function hideDevtoolsStatusBar () {
    statusBars.devToolsStatusBar.hide()
}