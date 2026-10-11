/** Suggest Vue route/public paths from the document's Nuxt project and configured directories. */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { CompletionItem, CompletionItemKind, CompletionItemProvider, Position, TextDocument } from 'vscode';
import { containsPath } from '../../core/project';
import { currentProject, withProject } from '../../services/project';
import { projectDirectory } from '../../utils/nuxt';

/** List safe child paths in a resolved directory; incomplete/unresolved configurations offer no guessed paths. */
function completePath (document: TextDocument, position: Position, kind: 'public' | 'pages'): CompletionItem[] {
    const prefix = document.lineAt(position).text.slice(0, position.character);
    const match = (kind === 'public' ? /\b(?:src|href)=["']\/([^"']*)$/ : /\bto=["']\/([^"']*)$/).exec(prefix);
    if (!match) { return []; }
    try {
        return withProject(currentProject(document.uri), () => {
            const root = projectDirectory(kind);
            const directory = resolve(root, match[1].slice(0, match[1].lastIndexOf('/') + 1));
            if (!containsPath(root, directory)) { return []; }
            return readdirSync(directory, { withFileTypes: true }).filter(entry => kind === 'public' || entry.isDirectory() || entry.name.endsWith('.vue')).map(entry => {
                const name = kind === 'pages' && entry.isFile() ? entry.name.replace(/\.vue$/, '') : entry.name;
                const item = new CompletionItem(name, entry.isDirectory() ? CompletionItemKind.Folder : CompletionItemKind.File);
                item.insertText = entry.isDirectory() ? name + '/' : name;
                return item;
            });
        });
    } catch { return []; }
}
export class PublicDirCompletionProvider implements CompletionItemProvider {
    /** Resolve root-level public assets for this document, including Nuxt 4's separate public directory. */
    provideCompletionItems (document: TextDocument, position: Position) { return completePath(document, position, 'public'); }
}
export class NuxtPagesCompletionProvider implements CompletionItemProvider {
    /** Resolve page route names from this document's configured app/pages directory. */
    provideCompletionItems (document: TextDocument, position: Position) { return completePath(document, position, 'pages'); }
}
