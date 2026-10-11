/** Own completion providers and apply IntelliSense settings immediately when configuration changes. */
import { Disposable, ExtensionContext, languages, workspace } from 'vscode';
import { NuxtModulesCompletionProvider } from './completionProviders/modules';
import { NuxtIgnoreCompletionProvider } from './completionProviders/nuxtIgnore';
import { CustomCompletionProvider } from './completionProviders/nuxtRC';
import { NuxtPagesCompletionProvider, PublicDirCompletionProvider } from './completionProviders/vueFiles';
import { languageSelector, nuxtrConfiguration, patternSelector } from '../utils';
import { onProjectSelected } from '../services/project';

/** Replace configured registrations without retaining providers from a previous project or setting. */
export function activateIntellisense (context: ExtensionContext) {
    const providers: Disposable[] = [];
    /** Rebuild the small provider set from the currently scoped settings. */
    const refresh = () => {
        for (const provider of providers.splice(0)) { provider.dispose(); }
        const settings = nuxtrConfiguration().intellisense;
        providers.push(languages.registerCompletionItemProvider([{ language: 'typescript' }, { language: 'javascript' }], new NuxtModulesCompletionProvider(context.globalState), '"', '\'', '@', '/'));
        if (settings.nuxtignore) { providers.push(languages.registerCompletionItemProvider(patternSelector('**/.nuxtignore'), new NuxtIgnoreCompletionProvider(), '/')); }
        if (settings.vueFiles) {
            providers.push(languages.registerCompletionItemProvider(languageSelector('vue'), new NuxtPagesCompletionProvider(), '/', '\\'),
                languages.registerCompletionItemProvider(languageSelector('vue'), new PublicDirCompletionProvider(), '/', '\\'));
        }
        if (settings.nuxtrc) { providers.push(languages.registerCompletionItemProvider(patternSelector('**/.nuxtrc'), new CustomCompletionProvider(), '.')); }
    };
    context.subscriptions.push({ dispose: () => { for (const provider of providers.splice(0)) { provider.dispose(); } } },
        onProjectSelected(refresh), workspace.onDidChangeConfiguration(event => { if (event.affectsConfiguration('nuxtr.intellisense')) { refresh(); } }));
    refresh();
}
