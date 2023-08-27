import { languages, ExtensionContext } from 'vscode';
import { NuxtIgnoreCompletionProvider } from './completionProviders/nuxtIgnore';
import { CustomCompletionProvider } from './completionProviders/nuxtRC'
import { PublicDirCompletionProvider, NuxtPagesCompletionProvider } from './completionProviders/vue';
import { languageSelector, patternSelector } from '../utils';


const nuxtIgnoreProvider = languages.registerCompletionItemProvider( patternSelector('**/.nuxtignore') , new NuxtIgnoreCompletionProvider(), '/')
const nuxtPagesProvider = languages.registerCompletionItemProvider(languageSelector('vue'), new NuxtPagesCompletionProvider(), '/')
const publicDirProvider = languages.registerCompletionItemProvider(languageSelector('vue'), new PublicDirCompletionProvider(), '/')
const nuxtRCProvider = languages.registerCompletionItemProvider(patternSelector('**/.nuxtrc'), new CustomCompletionProvider(), '.')

export function activateIntellisense(context: ExtensionContext) {
    context.subscriptions.push( nuxtIgnoreProvider, nuxtPagesProvider, publicDirProvider, nuxtRCProvider );
}