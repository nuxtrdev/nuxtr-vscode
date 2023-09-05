import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const EXTENSIONS = ['.vue', '.js', '.ts'];
const DIR_SEPARATOR = path.sep;
const SCOPED_DIRECTORIES = ['components', 'layouts', 'pages', 'composables', 'middleware'];

export class NuxtIgnoreCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        try {
            const lineText = document.lineAt(position).text;
            const currentDirectory = path.dirname(document.fileName);

            if (position.character === lineText.length) {
                const textBeforeCursor = lineText.substr(0, position.character);
                const pathSeparatorIndex = textBeforeCursor.lastIndexOf(DIR_SEPARATOR);

                if (pathSeparatorIndex !== -1) {
                    const userTypedPath = textBeforeCursor.substring(0, pathSeparatorIndex);
                    const targetDirectory = path.join(currentDirectory, userTypedPath);
                    const subDirectories = this.getSubDirectories(targetDirectory);

                    return this.createCompletionItems(subDirectories);
                } else {
                    const topLevelSubDirectories = this.getTopLevelSubDirectories(currentDirectory);
                    return this.createCompletionItems(topLevelSubDirectories);
                }
            }
        } catch (error) {
            this.logError(error);
        }

        return null;
    }

    private createCompletionItems(directories: string[]): vscode.CompletionItem[] {
        return directories.map(subDir => {
            const type = this.getCompletionItemType(subDir);
            const item = new vscode.CompletionItem(subDir, type);

            if (type === vscode.CompletionItemKind.Folder) {
                item.insertText = new vscode.SnippetString(subDir);
            }

            return item;
        });
    }

    private getCompletionItemType(name: string): vscode.CompletionItemKind {
        const extension = path.extname(name);
        return EXTENSIONS.includes(extension) ? vscode.CompletionItemKind.File : vscode.CompletionItemKind.Folder;
    }

    private getSubDirectories(directory: string): string[] {
        try {
            if (fs.existsSync(directory)) {
                return fs.readdirSync(directory, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory() || EXTENSIONS.includes(path.extname(dirent.name)))
                    .map(dirent => dirent.name);
            }
        } catch (error) {
            this.logError(error);
        }

        return [];
    }

    private getTopLevelSubDirectories(directory: string): string[] {
        return this.getSubDirectories(directory).filter(subDir => SCOPED_DIRECTORIES.includes(subDir));
    }

    private logError(error: any): void {
        console.error(error);
    }
}
