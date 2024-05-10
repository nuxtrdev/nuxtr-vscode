import { CompletionItem, CompletionItemKind, MarkdownString, extensions, languages } from 'vscode';
import { existsSync, mkdirSync, move, readdirSync, statSync } from 'fs-extra';
import { join, resolve } from 'pathe';
import { homedir } from 'node:os';

import { generateVueFileBasicTemplate } from '../utils';


function moveSnippets(sourceDir: string, destinationDir: string) {
    if (!existsSync(destinationDir)) {
        mkdirSync(destinationDir);
    }

    const snippets = readdirSync(sourceDir);
    snippets.forEach((snippet) => {
        const sourcePath = join(sourceDir, snippet);
        const destinationPath = join(destinationDir, snippet);
        const stats = statSync(sourcePath);
        if (stats.isDirectory()) {
            moveSnippets(sourcePath, destinationPath);
        } else {
            console.log(`Moving ${snippet} from ${sourceDir} to ${destinationDir}`);
            move(sourcePath, destinationPath, (err) => {
                console.log(`Moved ${snippet} from ${sourceDir} to ${destinationDir}`);

                if (err) {
                    console.error(`Error moving ${snippet} from ${sourceDir} to ${destinationDir}: ${err}`);
                }
            });
        }
    });
}


export function toggleSnippets(directory: 'Nuxt' | 'Nitro', moveToDisabled: boolean) {
    const homeDir = homedir()
    const snippetsDir = 'snippets';
    const disabledSnippetsDir = 'disabled_snippets';
    const extensionName = 'nuxtr.nuxtr-vscode';
    const nuxtrVersion = extensions.getExtension(extensionName)?.packageJSON.version;
    const extensionDir = resolve(homeDir, '.vscode', 'extensions', `${extensionName}-${nuxtrVersion}`);

    const sourceDir = join(extensionDir, snippetsDir, directory);
    const destinationDir = join(extensionDir, disabledSnippetsDir, directory);


    if (!existsSync(moveToDisabled ? sourceDir : destinationDir)) {
        console.error(`Directory '${directory}' does not exist inside '${moveToDisabled ? snippetsDir : disabledSnippetsDir}'`);
        return;
    }

    if (moveToDisabled) {
        console.log(`Moving snippets from '${directory}' to 'disabled_snippets/${directory}'`);
        moveSnippets(sourceDir, destinationDir);
    } else {
        console.log(`Moving snippets from 'disabled_snippets/${directory}' to '${directory}'`);
        moveSnippets(destinationDir, sourceDir);
    }
}


languages.registerCompletionItemProvider(
    { language: 'vue' },
    {
        provideCompletionItems() {
            const completionItem = new CompletionItem('vueBase', CompletionItemKind.Snippet);
            completionItem.detail = 'Generate a Vue page/component template';

            const template = generateVueFileBasicTemplate('page');

            // Create a MarkdownString for documentation with code highlighting
            const documentation = new MarkdownString();
            documentation.appendMarkdown(`Generate a Vue page/component template according to your Nuxtr configuration.\n\n`);
            documentation.appendCodeblock(template, 'vue'); // Specify 'vue' as the language for code block highlighting

            completionItem.documentation = documentation;
            completionItem.kind = CompletionItemKind.Snippet;
            completionItem.insertText = template;

            return [completionItem];
        }
    }
);


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
