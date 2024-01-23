import { extensions, window , commands} from "vscode";
import { openExternalLink, isNuxtTwo } from "../utils";

const checkTakeOverMode = async () => {
    const tsExtension = extensions.getExtension('vscode.typescript-language-features')
    console.log('tsExtension', tsExtension);

    if (tsExtension !== undefined && !isNuxtTwo()) {
        const message = await window.showWarningMessage(
            `Volar's TakeOver mode is not enabled`, 'Enable', 'Learn More'
        )

        if (message === 'Learn More') {
            openExternalLink('https://nuxt.com/docs/getting-started/installation#prerequisites')
        }

        if (message === 'Enable') {
            await commands.executeCommand('workbench.view.extensions');
            await commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', ['vscode.typescript-language-features']);
            await commands.executeCommand(
                'workbench.extensions.action.enableExtension',
                'vscode.typescript-language-features'
            )
        }
    }
}


export { checkTakeOverMode }