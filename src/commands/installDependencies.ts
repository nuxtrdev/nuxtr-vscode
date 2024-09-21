import * as vscode from 'vscode';
import pm from '../content/pm';
import { detectPackageManagerByName, newTerminal } from '../utils';


export const installDependencies = () => {
    const packageManager = detectPackageManagerByName()

    const items: vscode.QuickPickItem[] = pm.map((item) => {
        return {
            label: item.name,
        }
    })

    const options: vscode.QuickPickOptions = {
        canPickMany: false,
        ignoreFocusOut: true,
        placeHolder: 'No package manager detected. Chose one!',
    }

    if (packageManager) {
        if (packageManager.installCommand.includes('yarn')) {
            packageManager.installCommand = 'yarn'
        }
        newTerminal('Install Dependencies', packageManager.installCommand)
    } else {
        vscode.window.showQuickPick(items, options).then((name) => {
            if (name) {
                const command = pm.find(
                    (item) => item.name === name.label
                )?.installCommand
                if (command) {
                    newTerminal('Install Dependencies', command)
                }
            }
        })
    }
}