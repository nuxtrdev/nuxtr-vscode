import { window, workspace, Uri } from 'vscode';
import * as fs from 'fs';

import * as path from 'path';
import { TextEncoder } from 'util';

import { getCommandType } from './commands';

import { getConfiguration, projectSrcDirectory, projectRootDirectory } from './global';

export const createDirectoryAndFile = (componentName: any, commandType: string, content: string) => {

    const { type } = getCommandType(commandType);

    window
        .showInputBox({
            prompt: 'What is your directory name?',
            placeHolder: 'Directory name',
        })
        .then((name) => {
            if (name !== undefined && name.trim() !== '') {

                let workspaceFolder = workspace.workspaceFolders?.[0];
                let cwd = workspaceFolder?.uri.fsPath;

                if (cwd !== undefined) {
                    let dir = path.join(cwd, `${type.path}`);
                    let directoryPath = path.join(dir, name);

                    if (!fs.existsSync(directoryPath)) {
                        fs.mkdirSync(directoryPath);

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
    if (projectSrcDirectory() !== projectRootDirectory()) {
        if (!fs.existsSync(`${projectSrcDirectory()}`)) {
            fs.mkdirSync(`${projectSrcDirectory()}`);
        }
    }

    let dirPath = `${projectSrcDirectory()}/${dir}`;

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

};

export const createSubFolders = (dir: string, commandType: string) => {
    let subFolders = fs
        .readdirSync(dir, { withFileTypes: true })
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
                    createDirectoryAndFile(args.name, type.name.toLocaleLowerCase(), args.content);
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

    if (fs.existsSync(parentDirectory.fsPath)) {
        window.showErrorMessage(`File ${args.fileName} already exists`);
        return;
    }

    // Create the file and write its contents
    await workspace.fs.writeFile(parentDirectory, new TextEncoder().encode(args.content));

    // Open the file
    if (getConfiguration().openItemsAfterCreation) {
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

    if (!fs.existsSync(`${projectSrcDirectory()}/.vscode`)) {
        fs.mkdirSync(`${projectSrcDirectory()}/.vscode`);
    }

    window
        .showInputBox({
            prompt: 'What is your page template name?',
            placeHolder: 'Page template name',
        })
        .then((name) => {
            if (name !== undefined && name.trim() !== '') {
                createFile({
                    fileName: name,
                    content,
                    fullPath: `${projectSrcDirectory()}/.vscode/${name}.${type}-template`
                });
            }
        });

};
