import { window, workspace, Uri } from 'vscode';
import { trim, capitalize, replace, split, endsWith } from 'string-ts';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'pathe';
import { TextEncoder } from 'util';

import { getCommandType } from './commands';

import { nuxtrConfiguration, projectSrcDirectory, projectRootDirectory, vscodeConfiguration } from '.';

let eolConfiguration = vscodeConfiguration().files.eol
let eol = eolConfiguration === 'auto' ? '\n' : eolConfiguration

const createDirectoryAndFile = async (componentName: any, commandType: string, content: string) => {

    const { type } = await getCommandType(commandType);

    window
        .showInputBox({
            prompt: 'What is your directory name?',
            placeHolder: 'Directory name',
        })
        .then(async (name) => {
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
                            fullPath: `${await projectSrcDirectory()}/${type.path}/${name}/${normalizeFileExtension(componentName, type.extension)}${type.extension}`,
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

export const createDir = async (dir: string) => {
    if (`${await projectSrcDirectory()}` !== `${projectRootDirectory()}`) {
        if (!existsSync(`${await projectSrcDirectory()}`)) {
            mkdirSync(`${await projectSrcDirectory()}`);
        }
    }

    let dirParts = dir.split('/');
    let currentPath = `${await projectSrcDirectory()}`


    for (let part of dirParts) {
        currentPath = `${currentPath}/${part}`;

        if (!existsSync(currentPath)) {
            mkdirSync(currentPath);
        }
    }
};

export const createSubFolders = async (dir: string, commandType: string) => {
    let subFolders =
        readdirSync(dir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

    const { type } = await getCommandType(commandType);


    subFolders.unshift('Create new folder...');
    subFolders.push(`Main ${type.name.toLocaleLowerCase()} folder`);

    return subFolders;
};

export const showSubFolderQuickPick = async (args: {
    subFolders?: any
    name: string
    commandType: string
    content: any
}) => {
    const { type } = await getCommandType(args.commandType);

    window
        .showQuickPick(args.subFolders, { placeHolder: 'Select a subfolder' })
        .then(async(selection) => {
            if (selection === undefined) {
                return;
            }

            switch (selection) {
                case `Main ${type.name.toLocaleLowerCase()} folder`:
                    const path = `${normalizeFileExtension(args.name, type.extension)}${type.extension}`;
                    const fullPath = `${await projectSrcDirectory()}/${type.path}/${path}`;

                    createFile({
                        fileName: args.name,
                        content: args.content,
                        fullPath: fullPath
                    });
                    break;
                case 'Create new folder...':
                    createDirectoryAndFile(normalizeFileExtension(args.name, type.extension), type.name, args.content);
                    break;
                default:
                    const fileNameAndPath = `${selection}/${normalizeFileExtension(args.name, type.extension)}${type.extension}`;

                    await createFile({
                        fileName: args.name,
                        content: args.content,
                        fullPath: `${await projectSrcDirectory()}/${type.path}/${fileNameAndPath}`,
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

    await workspace.fs.writeFile(parentDirectory, new TextEncoder().encode(args.content));

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

export const normalizeName = (name: string, capital?: boolean) => split(trim(split(name, '.')[0]), "-").map(capitalize).join('');

export const normalizeFileExtension = (name: string, extension: string) => endsWith(name, extension) ? replace(name, extension, '') : name
