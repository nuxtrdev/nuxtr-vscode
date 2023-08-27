// TODO: Handlie dynamic imports for first level of directories
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { projectSrcDirectory, projectRootDirectory } from '../../utils';

let srcDir = `${projectSrcDirectory()}`;
let rootDir = `${projectRootDirectory()}`

export class NuxtIgnoreCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        try {
            // Check if the current document is a .nuxtignore file
            if (document.fileName.endsWith('.nuxtignore')) {
                const lineText = document.lineAt(position).text;
                const currentDirectory = path.dirname(document.fileName);

                // Check if the cursor is at the end of the line before providing completions
                if (position.character === lineText.length) {
                    // Get the word at the current cursor position
                    const wordRange = document.getWordRangeAtPosition(position);
                    const currentWord = wordRange ? document.getText(wordRange) : '';

                    // Get the text before the cursor position
                    const textBeforeCursor = lineText.substr(0, position.character);

                    // Check if the user is typing a path (ending with '/')
                    const pathSeparatorIndex = textBeforeCursor.lastIndexOf('/');
                    if (pathSeparatorIndex !== -1) {
                        const userTypedPath = textBeforeCursor.substring(0, pathSeparatorIndex);
                        const targetDirectory = path.join(currentDirectory, userTypedPath);

                        // Get all subdirectories within the target directory
                        const subDirectories = this.getSubDirectories(targetDirectory);

                        // Create completion items for subdirectories
                        const completionItems: vscode.CompletionItem[] = subDirectories.map(subDir => {
                            const type = subDir.endsWith('.vue') ? vscode.CompletionItemKind.File : vscode.CompletionItemKind.Folder;
                            const item = new vscode.CompletionItem(subDir, type);
                            // Insert trailing slash for directories, but not for Vue files
                            item.insertText = type === vscode.CompletionItemKind.Folder ? new vscode.SnippetString(subDir + '/') : subDir;

                            return item;
                        });

                        return completionItems;
                    } else {
                        // User is typing the initial path or listing options, so provide top-level subdirectories
                        const topLevelSubDirectories = this.getSubDirectories(currentDirectory);
                        const completionItems: vscode.CompletionItem[] = topLevelSubDirectories.map(subDir => {
                            const item = new vscode.CompletionItem(subDir, vscode.CompletionItemKind.Folder);
                            item.insertText = new vscode.SnippetString(subDir + '/');
                            return item;
                        });

                        // If the current word matches the word in the line, add it as a completion item
                        if (currentWord && !topLevelSubDirectories.includes(currentWord)) {
                            const currentWordItem = new vscode.CompletionItem(currentWord, vscode.CompletionItemKind.Folder);
                            currentWordItem.insertText = new vscode.SnippetString(currentWord + '/');
                            completionItems.push(currentWordItem);
                        }

                        return completionItems;
                    }
                }
            }
        } catch (error) {
            // Log the error to the Output channel for debugging
            const outputChannel = vscode.window.createOutputChannel('NuxtIgnoreCompletionError');
            outputChannel.appendLine(`Error occurred in NuxtIgnoreCompletionProvider: ${error}`);
            outputChannel.show();
        }

        // Return null if not inside a .nuxtignore file or any error occurred
        return null;
    }

    private getSubDirectories(directory: string): string[] {
        try {
            if (fs.existsSync(directory)) {
                return fs.readdirSync(directory, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory() || dirent.name.endsWith('.vue'))
                    .map(dirent => dirent.name);
            }
        } catch (error) {
            // Log the error to the Output channel for debugging
        }

        return [];
    }
}