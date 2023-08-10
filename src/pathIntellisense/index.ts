import { languages, ExtensionContext } from 'vscode';
import { NuxtIgnoreCompletionProvider } from './completionProviders/nuxtIgnore';

export function activatePathIntellisense(context: ExtensionContext) {
    context.subscriptions.push(
        languages.registerCompletionItemProvider({ scheme: 'file', pattern: '**/.nuxtignore' }, new NuxtIgnoreCompletionProvider(), '/')
    );
}