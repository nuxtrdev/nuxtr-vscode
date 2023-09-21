import { window } from 'vscode'
import { jiti, isNuxiInstalled, newTerminal } from '../utils'
const { main, runMain, runCommand } = jiti("nuxi-edge");


export const cliCommands = main.subCommands
export const runCliCommands = runMain
export const runCliCommand = runCommand

export async function checkCLIInstallation() {
    const result = await isNuxiInstalled()

    if (!result) {
        let message = 'Nuxt CLI is not installed. Do you want to install it?'
        let action = 'Install Nuxt CLI'

        window.showInformationMessage(message, action).then((value) => {
            if (value) {
                const command = 'npm install -g nuxi'
                newTerminal("Install Nuxi", command)
            }
        })
    }
}
