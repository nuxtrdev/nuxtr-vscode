import { MarkdownString, languages, CompletionItem, CompletionItemKind, Position, TextDocument } from 'vscode';
import { generateVueFileBasicTemplate } from '../utils';


const vuePageTemplate = languages.registerCompletionItemProvider(
    { language: 'vue' },
    {
        provideCompletionItems(document: TextDocument, position: Position) {
            const completionItem = new CompletionItem('vueBase', CompletionItemKind.Snippet);
            completionItem.detail = 'Generate a Vue page/component template';

            const template = generateVueFileBasicTemplate('page');

            const documentation = new MarkdownString();
            documentation.appendMarkdown(`Generate a Vue page/component template according to your Nuxtr configuration.\n\n`);
            documentation.appendCodeblock(template, 'vue');

            completionItem.documentation = documentation;
            completionItem.kind = CompletionItemKind.Snippet;
            completionItem.insertText = template;

            return [completionItem];
        }
    }
);


const vueBaseTemplate = languages.registerCompletionItemProvider(
    { language: 'vue' },
    {
        provideCompletionItems(document: TextDocument, position: Position) {
            const completionItem = new CompletionItem('vueBaseLayout', CompletionItemKind.Snippet);
            completionItem.detail = 'Generate a Vue file template';

            const template = generateVueFileBasicTemplate('layout');

            const documentation = new MarkdownString();
            documentation.appendMarkdown(`Generate a Vue file template according to your Nuxtr configuration.\n\n`);
            documentation.appendCodeblock(template, 'vue');

            completionItem.documentation = documentation;
            completionItem.kind = CompletionItemKind.Snippet;
            completionItem.insertText = template;

            return [completionItem];
        }
    }
);
