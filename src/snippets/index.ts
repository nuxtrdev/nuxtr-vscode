import { CompletionItem, CompletionItemKind, MarkdownString, extensions, languages } from 'vscode';
import { resolve } from 'pathe';
import { readPackageJSON, writePackageJSON } from 'pkg-types'
import { homedir } from 'node:os';
import { generateVueFileBasicTemplate } from '../utils';

interface Snippet {
    language: string;
    path: string;
}


export async function toggleSnippets(source: 'Nuxt' | 'Nitro', moveToDisabled: boolean) {
    const homeDir = homedir();
    const extensionName = 'nuxtr.nuxtr-vscode';
    const nuxtrVersion = await extensions.getExtension(extensionName)?.packageJSON.version;

    const extensionDir = resolve(homeDir, '.vscode', 'extensions', `${extensionName}-${nuxtrVersion}`);
    const pkgJsonPath = resolve(extensionDir, 'package.json');
    const pkgJSON = await readPackageJSON(extensionDir);
    let snippets: Snippet[] = pkgJSON?.contributes?.snippets || [];
    let disabledSnippets: Snippet[] = pkgJSON?.contributes?.disabled_snippets || [];

    const filteredSnippets = snippets.filter(snippet => snippet.path.includes(source.toLowerCase()));
    const filteredDisabledSnippets = disabledSnippets.filter(snippet => snippet.path.includes(source.toLowerCase()));

    if (moveToDisabled) {
        snippets = [...new Set([...snippets, ...filteredDisabledSnippets])];
        disabledSnippets = disabledSnippets.filter(snippet => !filteredDisabledSnippets.includes(snippet));
    } else {
        disabledSnippets = [...new Set([...disabledSnippets, ...filteredSnippets])];
        snippets = snippets.filter(snippet => !filteredSnippets.includes(snippet));

    }

    pkgJSON.contributes.snippets = snippets;
    pkgJSON.contributes.disabled_snippets = disabledSnippets;

    try {
        await writePackageJSON(pkgJsonPath, pkgJSON);
    } catch (error) {
        console.log('error updating tsConfig', error);
    }
}


languages.registerCompletionItemProvider(
    { language: 'vue' },
    {
        provideCompletionItems() {
            const completionItem = new CompletionItem('vueBaseLayout', CompletionItemKind.Snippet);
            completionItem.detail = 'Generate a Vue file template';

            const template = generateVueFileBasicTemplate('layout');

            // Create a MarkdownString for documentation with code highlighting
            const documentation = new MarkdownString();
            documentation.appendMarkdown(`Generate a Vue file template according to your Nuxtr configuration.\n\n`);
            documentation.appendCodeblock(template, 'vue'); // Specify 'vue' as the language for code block highlighting

            completionItem.documentation = documentation;
            completionItem.kind = CompletionItemKind.Snippet;
            completionItem.insertText = template;

            return [completionItem];
        }
    }
);
