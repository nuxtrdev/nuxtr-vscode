/** Shared VS Code document selectors, directory checks and folder navigation. */
import { DocumentSelector, FileType, QuickInputButton, ThemeIcon, Uri, commands, window, workspace } from 'vscode';

/** Select a language in local and remote extension hosts. */
export const languageSelector = (language: string): DocumentSelector => ({ language } as const);

/** Select resource paths without restricting the filesystem scheme. */
export const patternSelector = (pattern: string): DocumentSelector => ({ pattern } as const);


/** Check a directory through VS Code’s filesystem provider. */
export async function isDirectory (filePath: string): Promise<boolean> {
    try {
        const stat = await workspace.fs.stat(Uri.file(filePath));
        return stat.type === FileType.Directory;
    } catch {
        return false;
    }
}


/** Open a newly created project folder with the requested window behavior. */
export async function openFolder (path: Uri, folderName: string, newWindow: boolean) {
    try {
        await commands.executeCommand('vscode.openFolder', path, {
            forceNewWindow: newWindow,
        });
    } catch {
        window.showErrorMessage(`Failed to open Nuxt ${folderName} template`)
    }
}


const github: QuickInputButton = {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Template Github Repo',
};

const docs: QuickInputButton = {
    iconPath: new ThemeIcon('book'),
    tooltip: 'Template Docs/Reference',
};


export const quickOpenButtons = {
    github,
    docs,
}