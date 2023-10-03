import * as vscode from "vscode"
import { detectPackageManagerByName } from "../utils"
import pm from "../content/pm"
import { newTerminal, getInstallationCommand, runCommand } from "../utils"


let currentRequest: any // Store the current request promise
let timeout: NodeJS.Timeout | undefined // Store the timeout reference

const github: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon("nuxtr-github"),
    tooltip: "Github",
}

const npm: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon("nuxtr-npm"),
    tooltip: "NPM Page",
}

const installDependencies = () => {
    const packageManager = detectPackageManagerByName()

    const items: vscode.QuickPickItem[] = pm.map((item) => {
        return {
            label: item.name,
        }
    })

    const options: vscode.QuickPickOptions = {
        canPickMany: false,
        ignoreFocusOut: true,
        placeHolder: "No package manager detected. Chose one!",
    }

    if (!packageManager) {
        vscode.window.showQuickPick(items, options).then((name) => {
            if (name) {
                let command = pm.find(
                    (item) => item.name === name.label
                )?.installCommand
                if (command) {
                    newTerminal("Install Dependencies", command)
                }
            }
        })
    } else {
        if (packageManager.installCommand.includes("yarn")) {
            packageManager.installCommand = "yarn"
        }
        newTerminal("Install Dependencies", packageManager.installCommand)
    }
}

function showSearchResults(
    results: any[],
    quickPick: vscode.QuickPick<vscode.QuickPickItem>
) {
    const resultItems = results.map((result) => {
        const item: vscode.QuickPickItem & { package: any } = {
            label: result.package.name,
            description: result.package.description,
            package: result.package,
        }

        item.buttons = [github, npm]

        return item
    })

    quickPick.items = resultItems

    quickPick.onDidTriggerItemButton(async (e) => {
        const selectedItem = e.item as vscode.QuickPickItem & { package: any }

        if (e.button === github) {
            vscode.env.openExternal(selectedItem.package.links.repository)
        }

        if (e.button === npm) {
            vscode.env.openExternal(selectedItem.package.links.npm)
        }
    })

    quickPick.onDidChangeSelection(async (item: any) => {
        quickPick.dispose()

        let chosenPackage = item[0]
        const command = await getInstallationCommand(chosenPackage.label, true)

        await runCommand({
            command,
            message: `Installing ${chosenPackage.label}...`,
            successMessage: `${chosenPackage.label} installed successfully`,
            errorMessage: `${chosenPackage.label} installation failed`,
        })
    })
}

export { installDependencies  }
