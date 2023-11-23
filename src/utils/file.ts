import { window, workspace, Uri } from 'vscode';
import { trim, capitalize, replace, split } from 'string-ts';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'pathe';
import { TextEncoder } from 'util';

import { getCommandType } from './commands';

import { nuxtrConfiguration, projectSrcDirectory, projectRootDirectory, vscodeConfiguration, normalizeLFToCRLF } from '.';

let eolConfiguration = vscodeConfiguration().files.eol
let eol = eolConfiguration === 'auto' ? '\n' : eolConfiguration

export const createDirectoryAndFile = (componentName: any, commandType: string, content: string) => {

    const { type } = getCommandType(commandType);

    window
        .showInputBox({
            prompt: 'What is your directory name?',
            placeHolder: 'Directory name',
        })
        .then((name) => {
            if (name !== undefined && trim(name) !== '') {

                let workspaceFolder = workspace.workspaceFolders?.[0];
                let cwd = workspaceFolder?.uri.fsPath;

                if (cwd !== undefined) {
                    let dir = join(cwd, `${type.path}`);
                    let directoryPath = join(dir, name);

                    if (!existsSync(directoryPath)) {
                        mkdirSync(directoryPath);

                        createFile({
                            fileName: componentName,
                            content,
                            fullPath: `${projectSrcDirectory()}/${type.path}/${name}/${componentName}${type.extension}`,
                        });
                    } else {
                        window.showWarningMessage(
                            `Directory ${name} already exists in ./${type.path}/${name}`
                        );
                    }
                }
            }
        });
};

export const createDir = (dir: string) => {
    if (`${projectSrcDirectory()}` !== `${projectRootDirectory()}`) {
        if (!existsSync(`${projectSrcDirectory()}`)) {
            mkdirSync(`${projectSrcDirectory()}`);
        }
    }

    let dirParts = dir.split('/');
    let currentPath = `${projectSrcDirectory()}`

    for (let part of dirParts) {
        currentPath = `${currentPath}/${part}`;

        if (!existsSync(currentPath)) {
            mkdirSync(currentPath);
        }
    }
};

export const createSubFolders = (dir: string, commandType: string) => {
    let subFolders =
        readdirSync(dir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

    const { type } = getCommandType(commandType);

    subFolders.unshift('Create new folder...');
    subFolders.push(`Main ${type.name.toLocaleLowerCase()} folder`);

    return subFolders;
};

export const showSubFolderQuickPick = (args: {
    subFolders?: any
    name: string
    commandType: string
    content: any
}) => {

    const { type } = getCommandType(args.commandType);

    window
        .showQuickPick(args.subFolders, { placeHolder: 'Select a subfolder' })
        .then((selection) => {
            if (selection === undefined) {
                return;
            }
            switch (selection) {
                case `Main ${type.name.toLocaleLowerCase()} folder`:
                    const path = `${args.name}${type.extension}`;
                    createFile({
                        fileName: args.name,
                        content: args.content,
                        fullPath: `${projectSrcDirectory()}/${type.path}/${path}`,
                    });
                    break;
                case 'Create new folder...':
                    createDirectoryAndFile(args.name, type.name, args.content);
                    break;
                default:
                    const fileNameAndPath = `${selection}/${args.name}${type.extension}`;
                    createFile({
                        fileName: args.name,
                        content: args.content,
                        fullPath: `${projectSrcDirectory()}/${type.path}/${fileNameAndPath}`,
                    });
                    break;
            }
        });
};

export const createFile = async (args: { fileName: string; content: string; fullPath: string }) => {
    let parentDirectory = Uri.file(args.fullPath);

    if (existsSync(parentDirectory.fsPath)) {
        window.showErrorMessage(`File ${args.fileName} already exists`);
        return;
    }

    let fileContent = eolConfiguration !== '\n' ? normalizeLFToCRLF(args.content) : args.content

    await workspace.fs.writeFile(parentDirectory, new TextEncoder().encode(fileContent));

    // Open the file
    if (nuxtrConfiguration().openItemsAfterCreation) {
        workspace.openTextDocument(parentDirectory).then((doc) => {
            window.showTextDocument(doc);
        });
    } else {
        window.showInformationMessage(`File created`, `Open ${args.fileName}`).then((value) => {
            if (value === `Open ${args.fileName}`) {
                workspace.openTextDocument(parentDirectory).then((doc) => {
                    window.showTextDocument(doc);
                });
            }
        });
    }
};

export const createVueTemplate = (content: string, type: string) => {

    if (!existsSync(`${projectRootDirectory()}/.vscode`)) {
        mkdirSync(`${projectRootDirectory()}/.vscode`);
    }

    window
        .showInputBox({
            prompt: 'What is your page template name?',
            placeHolder: 'Page template name',
        })
        .then((name) => {
            if (name !== undefined && trim(name) !== '') {
                createFile({
                    fileName: name,
                    content,
                    fullPath: `${projectRootDirectory()}/.vscode/${name}.${type}-template`
                });
            }
        });

};

export const normalizeName = (name: string, capital?: boolean) =>  split(trim(name), "-").map(capitalize).join('');