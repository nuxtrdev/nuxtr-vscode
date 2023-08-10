import * as vscode from 'vscode';
import { scanNuxtDirectories } from '../../utils/nuxt';

export class NuxtIgnoreDirCompletionProvider implements vscode.CompletionItemProvider {
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
        const lineText = document.lineAt(position).text;
        const cursorPosition = position.character;

        if (lineText.trim().startsWith('#') && cursorPosition > lineText.indexOf('#')) { return []; }

        const existingDirectories = await scanNuxtDirectories();

        const suggestions: vscode.CompletionItem[] = existingDirectories.map((dir) => ({
            label: `${dir}/`,
            kind: vscode.CompletionItemKind.Folder,
        }));

        return suggestions;
    }

}