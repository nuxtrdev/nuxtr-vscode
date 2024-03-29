import { ExtensionContext, commands } from 'vscode';
import { activateExtension, publicCommands } from './extension'
import { isNuxtProject , isNuxtTwo }  from './utils';

export async function activate(context: ExtensionContext) {
    const isNuxt = await isNuxtProject();


    commands.executeCommand('setContext', 'nuxtr.isNuxtProject', isNuxt);


    if (isNuxt) {
        const nuxtTwo = isNuxtTwo();
        commands.executeCommand('setContext', 'nuxtr.isNuxtTwo', nuxtTwo);

        await activateExtension(context);
    } else {
        publicCommands.forEach(({ command, function: commandFunction }) => {
            context.subscriptions.push(commands.registerCommand(command, commandFunction));
        });
    }
}
