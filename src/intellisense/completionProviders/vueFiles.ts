import { CompletionItem, CompletionItemKind, CompletionItemProvider, Position, ProviderResult, TextDocument } from 'vscode';
import { readdirSync, statSync } from 'node:fs';
import { join, sep } from 'pathe';

import { isDirectory, isNuxtTwo, projectSrcDirectory } from '../../utils';

let publicDir = isNuxtTwo() ? 'static' : 'public';
let pagesDir = 'pages';

const DIR_SEPARATOR = sep;

async function provider(dirPath: string): Promise<CompletionItem[]> {
    const items: CompletionItem[] = [];
    const fullPath = join(`${await projectSrcDirectory()}`, dirPath);
    const isDir = await isDirectory(fullPath);

    if (isDir) {
        const files = readdirSync(fullPath);

        for (const item of files) {
            const filePath = join(fullPath, item);
            const stat = statSync(filePath);

            const completionItem = new CompletionItem(
                item,
                stat.isFile() ? CompletionItemKind.File : CompletionItemKind.Folder
            );
            completionItem.insertText = stat.isFile() ? item : item + DIR_SEPARATOR;
            items.push(completionItem);
        }

        return items;
    } else {
        return []
    }
}

export class PublicDirCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position):
    ProviderResult<CompletionItem[]> {
        const currentLine = document.lineAt(position.line).text;
        const cursorPosition = position.character;
        const contentBeforeCursor = currentLine.slice(0, Math.max(0, cursorPosition));
        const subDirMatch = /src="\/([^"]*)/.exec(contentBeforeCursor);

        if (!subDirMatch) {
            return [];
        }

        if (subDirMatch && subDirMatch[1] === '..') {
            return [];
        }

        let isDir: Promise<boolean>;

        if (subDirMatch && subDirMatch[1] === '..') {
            const fullPathTest = join(`${projectSrcDirectory()}`, subDirMatch[1]);

            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                isDir = isDirectory(fullPathTest);
            } catch (error) {
                console.error('Error checking directory:', fullPathTest, error);
                return [];
            }
        }

        if (subDirMatch) {
            const subdirectoryPath = subDirMatch[1];


            const subdirectories = subdirectoryPath.split('/');

            let currentDir = isNuxtTwo() ? 'static' : 'public';
            const promises: Promise<CompletionItem[]>[] = [];

            for (const subdirectory of subdirectories) {
                currentDir = join(currentDir, subdirectory);
            }

            // Fetch the suggestions only once for the complete path
            promises.push(provider(currentDir));

            return Promise.all(promises)
                .then(subdirectorySuggestionsArray => {
                    const allSuggestions: CompletionItem[] = [];
                    for (const subdirectorySuggestions of subdirectorySuggestionsArray) {
                        allSuggestions.push(...subdirectorySuggestions);
                    }

                    const uniqueSuggestions = new Set(allSuggestions.map(suggestion => suggestion.label));

                    const suggestionsArray = [...uniqueSuggestions].map(label => {
                        // @ts-ignore
                        const isFile = label.includes('.');
                        const kind = isFile ? CompletionItemKind.File : CompletionItemKind.Folder;
                        return new CompletionItem(label, kind);
                    });

                    return suggestionsArray;
                })
        } else {
            publicDir = isNuxtTwo() ? 'static' : 'public';
        }

        return provider(publicDir);
    }
}

export class NuxtPagesCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position):
    ProviderResult<CompletionItem[]> {
        const currentLine = document.lineAt(position.line).text;
        const cursorPosition = position.character;
        const contentBeforeCursor = currentLine.slice(0, Math.max(0, cursorPosition));
        const subDirMatch = /to="\/([^"]*)/.exec(contentBeforeCursor);

        if (!subDirMatch) {
            return [];
        }

        if (subDirMatch && subDirMatch[1] === '..') {
            return [];
        }

        let isDir: Promise<boolean>;

        if (subDirMatch && subDirMatch[1] === '..') {
            const fullPathTest = join(`${projectSrcDirectory()}`, subDirMatch[1]);

            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                isDir = isDirectory(fullPathTest);
            } catch (error) {
                console.error('Error checking directory:', fullPathTest, error);
                return [];
            }
        }

        if (subDirMatch) {
            const subdirectoryPath = subDirMatch[1];

            const subdirectories = subdirectoryPath.split('/');

            let currentDir = 'pages';
            const promises: Promise<CompletionItem[]>[] = [];

            for (const subdirectory of subdirectories) {
                currentDir = join(currentDir, subdirectory);
            }

            // Fetch the suggestions only once for the complete path
            promises.push(provider(currentDir));

            return Promise.all(promises)
                .then(subdirectorySuggestionsArray => {
                    const allSuggestions: CompletionItem[] = [];
                    for (const subdirectorySuggestions of subdirectorySuggestionsArray) {
                        allSuggestions.push(...subdirectorySuggestions);
                    }

                    const uniqueSuggestions = new Set(allSuggestions.map(suggestion => suggestion.label));

                    const suggestionsArray = [...uniqueSuggestions].map(label => {
                        // @ts-ignore
                        const isFile = label.includes('.');
                        const kind = isFile ? CompletionItemKind.File : CompletionItemKind.Folder;
                        return new CompletionItem(label, kind);
                    });

                    return suggestionsArray;
                })
        } else {
            pagesDir = 'pages';
        }

        return provider(pagesDir);
    }
}
