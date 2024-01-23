import { MarkdownString, languages, CompletionItem, CompletionItemKind, Position, TextDocument, SnippetString } from 'vscode';
import { Snippet } from '../types'


export async function injectSnippets(source: Record<string, Snippet>, selectedLanguage: 'typescript' | 'vue' | 'javascript' | 'html') {
    for (const [name, snippet] of Object.entries(source)) {
        const { prefix, body, description } = snippet;

        languages.registerCompletionItemProvider(
            { language: selectedLanguage },
            {
                provideCompletionItems(document: TextDocument, position: Position) {
                    const completionItem = new CompletionItem(prefix, CompletionItemKind.Snippet);
                    completionItem.detail = description;

                    const snippetText = body.join('\n');
                    const documentation = new MarkdownString();
                    documentation.appendCodeblock(snippetText, name);

                    completionItem.documentation = documentation;
                    completionItem.kind = CompletionItemKind.Snippet;
                    completionItem.insertText = new SnippetString(snippetText);

                    return [completionItem];
                }
            }
        );
    }
}
