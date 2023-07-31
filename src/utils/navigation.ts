import { commands } from 'vscode'

export function openSettings() {
    commands.executeCommand('workbench.action.openSettings', 'nuxtr')
}