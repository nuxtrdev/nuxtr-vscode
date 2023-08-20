import { languages, ExtensionContext, DocumentSelector } from 'vscode';
import { NuxtIgnoreCompletionProvider } from './completionProviders/nuxtIgnore';
import { CustomCompletionProvider } from './completionProviders/nuxtRC'
import { PublicDirCompletionProvider, NuxtPagesCompletionProvider } from './completionProviders/vue';


const vueFilesSelector: DocumentSelector = {
    language: 'vue',
    scheme: 'file',
};


// TODO: create IntellisenseProvider interfaces and import them here

// export const providers: PathIntellisenseProvider[] = [
//   JavaScriptProvider,
//   DefaultProvider,
// ];

export function activateIntellisense(context: ExtensionContext) {
    context.subscriptions.push(
        languages.registerCompletionItemProvider({ scheme: 'file', pattern: '**/.nuxtignore' }, new NuxtIgnoreCompletionProvider(), '/')
    );

    context.subscriptions.push(
        languages.registerCompletionItemProvider({ scheme: 'file', pattern: '**/.nuxtrc' }, new CustomCompletionProvider())
    );

    context.subscriptions.push(
        languages.registerCompletionItemProvider( vueFilesSelector, new PublicDirCompletionProvider(), '/', )
    );

    context.subscriptions.push(
        languages.registerCompletionItemProvider(vueFilesSelector, new NuxtPagesCompletionProvider(), '/',)
    );

}