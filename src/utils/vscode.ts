import { DocumentSelector, workspace, Uri, FileType, commands, window } from 'vscode';

export const languageSelector = (language: string): DocumentSelector => ({ scheme: 'file', language, } as const);

export const patternSelector = (pattern: string): DocumentSelector => ({ scheme: 'file', pattern, } as const);

export async function pathExists(localPath: string): Promise<boolean> {
    try {
        await workspace.fs.stat(Uri.file(localPath));
        return true;
    } catch (e) {
        return false;
    }
}

export async function isDirectory(filePath: string): Promise<boolean> {
    try {
        const stat = await workspace.fs.stat(Uri.file(filePath));
        return stat.type === FileType.Directory;
    } catch (e) {
        return false;
    }
}

export async function readDirectory(filePath: string) {
    try {
        return await workspace.fs.readDirectory(Uri.file(filePath));
    } catch (e) {
        console.error(`Error reading directory: ${e}`);
        return [];
    }
}


export async function openFolder(path: Uri, folderName: string, newWindow: boolean) {
    try {
        await commands.executeCommand('vscode.openFolder', path, {
            forceNewWindow: newWindow,
        });
    } catch (error) {
        window.showErrorMessage(`Failed to open Nuxt ${folderName} template`)
    }
}