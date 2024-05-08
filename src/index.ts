import { ExtensionContext, commands } from 'vscode';
import { activateExtension, publicCommands } from './extension'
import { isNuxtProject , isNuxtTwo }  from './utils';

export async function activate(context: ExtensionContext) {
    const isNuxt = await isNuxtProject();


    commands.executeCommand('setContext', 'nuxtr.isNuxtProject', isNuxt);


    if (isNuxt) {
        const nuxtTwo = isNuxtTwo();
        commands.executeCommand('setContext', 'nuxtr.isNuxtTwo', nuxtTwo);

        activateExtension(context);
    } else {
        for (const { command, function: commandFunction } of publicCommands) {
            context.subscriptions.push(commands.registerCommand(command, commandFunction));
        }
    }
}
