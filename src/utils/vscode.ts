import { DocumentSelector, FileType, QuickInputButton, ThemeIcon, Uri, commands, window, workspace } from 'vscode';

export const languageSelector = (language: string): DocumentSelector => ({ scheme: 'file', language, } as const);

export const patternSelector = (pattern: string): DocumentSelector => ({ scheme: 'file', pattern, } as const);


export async function isDirectory (filePath: string): Promise<boolean> {
    try {
        const stat = await workspace.fs.stat(Uri.file(filePath));
        return stat.type === FileType.Directory;
    } catch {
        return false;
    }
}


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