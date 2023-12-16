import { ExtensionContext, commands } from 'vscode';
import nuxtrCommands from './commands'
import { activateExtension } from './extension'

const creationCommand = { command: 'nuxtr.createProject', function: async () => await nuxtrCommands.createProject() }

export async function activate(context: ExtensionContext) {
    const nuxtProject = true

    commands.executeCommand('setContext', 'nuxtr.isNuxtProject', nuxtProject)
    activateExtension(context)
}
