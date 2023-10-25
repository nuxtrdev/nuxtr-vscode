import { ExtensionContext, commands } from 'vscode';
import { activateExtension } from './extension'

export async function activate(context: ExtensionContext) {
    const nuxtProject = true

    commands.executeCommand('setContext', 'nuxtr.isNuxtProject', nuxtProject)
    activateExtension(context)
}