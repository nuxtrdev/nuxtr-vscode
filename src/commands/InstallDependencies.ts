import * as vscode from "vscode"
import axios from "axios"
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
                    newTerminal("Nuxtr: Install Dependencies", command)
                }
            }
        })
    } else {
        if (packageManager.installCommand.includes("yarn")) {
            packageManager.installCommand = "yarn"
        }
        newTerminal("Nuxtr: Install Dependencies", packageManager.installCommand)
    }
}

async function searchAndInstallDependencies() {
    const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>()
    quickPick.placeholder = "Enter a package name"
    quickPick.ignoreFocusOut = true

    const closeButton: vscode.QuickInputButton = {
        iconPath: new vscode.ThemeIcon("close"),
        tooltip: "Close",
    }

    quickPick.buttons = [closeButton]

    quickPick.onDidChangeValue((input) => {
        if (timeout) {
            clearTimeout(timeout) // Clear the previous timeout
        }

        timeout = setTimeout(async () => {
            if (input.length >= 2) {
                if (currentRequest) {
                    currentRequest.cancel("Request canceled due to new input")
                }

                quickPick.busy = true
                quickPick.enabled = false

                try {
                    const results = await performSearch(input)
                    showSearchResults(results.results, quickPick)
                    quickPick.value = ""
                } catch (error) {
                    console.error("Error during search:", error)
                    quickPick.items = []
                }

                quickPick.busy = false
                quickPick.enabled = true
            } else {
                quickPick.items = []
            }
        }, 500) // Delay in milliseconds (adjust as needed)

        quickPick.onDidTriggerButton((button) => {
            if (button === closeButton) {
                // Close button is clicked, dispose the QuickPick dialog
                quickPick.dispose()
            }
        })
    })

    quickPick.show()
}

async function performSearch(query: string) {
    query = query.replace(/\s/g, "+")
    const url = `https://api.npms.io/v2/search?q=${query}&size=20`

    const source = axios.CancelToken.source()
    currentRequest = source

    try {
        const response = await axios.get(url, {
            cancelToken: source.token,
        })

        return response.data
    } catch (error) {
        if (axios.isCancel(error)) {
            // Request was canceled, no need to handle the error
        } else {
            throw error // Re-throw the error to be caught in onDidChangeValue handler
        }
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

export { installDependencies, searchAndInstallDependencies }
