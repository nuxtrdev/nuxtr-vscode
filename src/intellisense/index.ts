import { ExtensionContext, languages } from 'vscode';
import { NuxtIgnoreCompletionProvider } from './completionProviders/nuxtIgnore';
import { CustomCompletionProvider } from './completionProviders/nuxtRC'
import { NuxtPagesCompletionProvider, PublicDirCompletionProvider } from './completionProviders/vueFiles';
import { languageSelector, nuxtrConfiguration, patternSelector } from '../utils';

const intelliSenseConfig = nuxtrConfiguration().intellisense;


export function activateIntellisense (context: ExtensionContext) {
    if (intelliSenseConfig.nuxtignore) {
        const nuxtIgnoreProvider = languages.registerCompletionItemProvider(
            patternSelector('**/.nuxtignore'),
            new NuxtIgnoreCompletionProvider(),
            '/',
        )

        context.subscriptions.push(nuxtIgnoreProvider);
    }

    if (intelliSenseConfig.vueFiles) {
        const nuxtPagesProvider = languages.registerCompletionItemProvider(
            languageSelector('vue'),
            new NuxtPagesCompletionProvider(),
            '/', '\\'
        )

        const publicDirProvider = languages.registerCompletionItemProvider(
            languageSelector('vue'),
            new PublicDirCompletionProvider(),
            '/', '\\'
        )


        context.subscriptions.push(nuxtPagesProvider, publicDirProvider);
    }

    if (intelliSenseConfig.nuxtrc) {
        const nuxtRCProvider = languages.registerCompletionItemProvider(
            patternSelector('**/.nuxtrc'),
            new CustomCompletionProvider(),
            '.'
        )

        context.subscriptions.push(nuxtRCProvider);
    }


}