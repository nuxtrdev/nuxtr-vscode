import { CompletionItemProvider, TextDocument, Position, ProviderResult, CompletionItemKind, CompletionItem } from 'vscode';
import { isNuxtTwo, projectSrcDirectory } from '../../utils';
import * as fs from 'fs';
import * as path from 'path';

let publicDir = isNuxtTwo() ? 'static' : 'public';
let pagesDir = 'pages';

const DIR_SEPARATOR = path.sep;

async function provider(dirPath: string): Promise<CompletionItem[]> {
    const items: CompletionItem[] = [];
    const fullPath = path.join(`${projectSrcDirectory()}`, dirPath);

    try {
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            for (const item of files) {
                const filePath = path.join(fullPath, item);
                const stat = fs.statSync(filePath);

                const completionItem = new CompletionItem(item, stat.isFile() ? CompletionItemKind.File : CompletionItemKind.Folder);
                completionItem.insertText = stat.isFile() ? item : item + DIR_SEPARATOR;
                items.push(completionItem);
            }
        }
    } catch (error) {
        console.error(error);
    }

    return items;
}

export class PublicDirCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position):
    ProviderResult<CompletionItem[]> {
        const currentLine = document.lineAt(position.line).text;
        const cursorPosition = position.character;
        const contentBeforeCursor = currentLine.substring(0, cursorPosition);

        const subDirMatch = /src="\/([^"]*)/.exec(contentBeforeCursor);

        if (!contentBeforeCursor.includes('src="/')) {
            return [];
        }

        if (subDirMatch && subDirMatch[1] === '..') {
            return [];
        }

        if (subDirMatch) {
            const subdirectoryPath = subDirMatch[1];
            const subdirectories = subdirectoryPath.split('/');

            let currentDir = publicDir;
            const promises: Promise<CompletionItem[]>[] = [];

            for (const subdirectory of subdirectories) {
                currentDir = path.join(currentDir, subdirectory);
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

                    const suggestionsArray = Array.from(uniqueSuggestions).map(label => {
                        // @ts-ignore
                        const isFile = label.includes('.');
                        const kind = isFile ? CompletionItemKind.File : CompletionItemKind.Folder;
                        return new CompletionItem(label, kind);
                    });

                    return suggestionsArray;
                });
        } else {
            publicDir = isNuxtTwo() ? 'static' : 'public'; // Reset if not in path context
        }

        return provider(publicDir);
    }

    private logError(error: any): void {
        // Log the error to the Output channel for debugging
        console.error(error);
    }
}

export class NuxtPagesCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position):
    ProviderResult<CompletionItem[]> {
        const currentLine = document.lineAt(position.line).text;
        const cursorPosition = position.character;
        const contentBeforeCursor = currentLine.substring(0, cursorPosition);
        const subDirMatch = /to="\/([^"]*)/.exec(contentBeforeCursor);

        if (!contentBeforeCursor.includes('to="/')) {
            return [];
        }

        if (subDirMatch && subDirMatch[1] === '..') {
            return [];
        }

        if (subDirMatch) {
            const subdirectoryPath = subDirMatch[1];
            const subdirectories = subdirectoryPath.split('/');

            let currentDir = 'pages';
            const promises: Promise<CompletionItem[]>[] = [];

            for (const subdirectory of subdirectories) {
                currentDir = path.join(currentDir, subdirectory);
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

                    const suggestionsArray = Array.from(uniqueSuggestions).map(label => {
                        // @ts-ignore
                        const isFile = label.includes('.');
                        const kind = isFile ? CompletionItemKind.File : CompletionItemKind.Folder;
                        return new CompletionItem(label, kind);
                    });

                    return suggestionsArray;
                });
        } else {
            pagesDir = 'pages';
        }

        return provider(pagesDir);
    }

    private logError(error: any): void {
        // Log the error to the Output channel for debugging
        console.error(error);
    }
}
