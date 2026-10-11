/** Create protected project files and directory/template pickers for the selected Nuxt context. */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { formatGeneratedContent, normalizedExtension,  writeNewFile } from '../core/generated';
import { dirname, isAbsolute, resolve } from 'node:path';
import { DirectoryKind } from '../core/directories';
import { projectDirectories } from './nuxt';
import { join } from 'pathe';
import { capitalize, endsWith, replace, split, trim } from 'string-ts';
import { Uri, window, workspace } from 'vscode';

import { getCommandType } from './commands';

import { nuxtrConfiguration, projectRootDirectory, projectSrcDirectory } from '.';


/** Prompt for a subfolder and create it under the resolved command directory. */
const createDirectoryAndFile = async (componentName: any, commandType: string, content: string) => {

    const { type } = await getCommandType(commandType);

    return window
        .showInputBox({
            prompt: 'What is your directory name?',
            placeHolder: 'Directory name',
        })
        .then(async (name) => {
            if (name !== undefined && trim(name) !== '') {

                {
                    const dir = resolve(await projectSrcDirectory(), type.path);
                    const directoryPath = join(dir, normalizeFileExtension(name, '.unused'));

                    if (existsSync(directoryPath)) {
                        window.showWarningMessage(
                            `Directory ${name} already exists in ./${type.path}/${name}`
                        );
                    } else {
                        await workspace.fs.createDirectory(Uri.file(directoryPath));

                        return createFile({
                            fileName: componentName,
                            content,
                            fullPath: `${await projectSrcDirectory()}/${type.path}/${name}/${normalizeFileExtension(componentName, type.extension)}${type.extension}`,
                        });
                    }
                }
            }
        });
};

/** Await creation of a logical or relative directory using the resolved Nuxt layout. */
export const createDir = async (dir: string) => {
    const directories = projectDirectories();
    const configured = directories[dir as DirectoryKind];
    const target = configured || (isAbsolute(dir) ? dir : resolve(directories.app, dir));
    await workspace.fs.createDirectory(Uri.file(target));
};

/** List immediate subfolders for the scaffold picker. */
export const createSubFolders = async (dir: string, commandType: string) => {
    const subFolders =
        readdirSync(dir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

    const { type } = await getCommandType(commandType);


    subFolders.unshift('Create new folder...');
    subFolders.push(`Main ${type.name.toLocaleLowerCase()} folder`);

    return subFolders;
};

/** Prompt for a destination and create the selected scaffold without overwriting a file. */
export const showSubFolderQuickPick = async (args: {
    subFolders?: any
    name: string
    commandType: string
    content: any
}) => {
    const { type } = await getCommandType(args.commandType);

    return window
        .showQuickPick(args.subFolders, { placeHolder: 'Select a subfolder' })
        .then(async (selection) => {
            if (selection === undefined) {
                return;
            }

            switch (selection) {
                case `Main ${type.name.toLocaleLowerCase()} folder`: {
                    const path = `${normalizeFileExtension(args.name, type.extension)}${type.extension}`;
                    const fullPath = `${await projectSrcDirectory()}/${type.path}/${path}`;

                    return createFile({
                        fileName: args.name,
                        content: args.content,
                        fullPath
                    });
                }
                case 'Create new folder...': {
                    return createDirectoryAndFile(normalizeFileExtension(args.name, type.extension), args.commandType, args.content);
                }
                default: {
                    const fileNameAndPath = `${selection}/${normalizeFileExtension(args.name, type.extension)}${type.extension}`;

                    await createFile({
                        fileName: args.name,
                        content: args.content,
                        fullPath: `${await projectSrcDirectory()}/${type.path}/${fileNameAndPath}`,
                    });
                }
            }
        });
};

/** Ensure parents exist and create a new file, preserving existing files. */
export const createFile = async (args: { fileName: string; content: string; fullPath: string }) => {
    const target = Uri.file(args.fullPath);
    const languageId = args.fullPath.endsWith('.vue') ? 'vue' : (args.fullPath.endsWith('.ts') ? 'typescript' : 'javascript');
    const editor = workspace.getConfiguration('editor', { uri: target, languageId });
    const eol = workspace.getConfiguration('files', target).get('eol') === '\r\n' ? '\r\n' : '\n';
    const content = formatGeneratedContent(args.content, editor.get('insertSpaces', true), editor.get('tabSize', 2), eol);
    const created = await writeNewFile(target.fsPath, content);
    if (!created) { window.showErrorMessage(`File ${args.fileName} already exists`); return false; }
    if (nuxtrConfiguration().openItemsAfterCreation) { await window.showTextDocument(await workspace.openTextDocument(target)); }
    return true;
};

/** Save a named Vue template in the selected project’s .vscode directory. */
export const createVueTemplate = (content: string, type: string) => {

    if (!existsSync(`${projectRootDirectory()}/.vscode`)) {
        mkdirSync(`${projectRootDirectory()}/.vscode`);
    }

    return window
        .showInputBox({
            prompt: 'What is your page template name?',
            placeHolder: 'Page template name',
        })
        .then((name) => {
            if (name !== undefined && trim(name) !== '') {
                return createFile({
                    fileName: name,
                    content,
                    fullPath: `${projectRootDirectory()}/.vscode/${normalizeFileExtension(name, `.${type}-template`)}.${type}-template`
                });
            }
        });

};

/** Remove a supplied suffix before the caller appends the expected extension. */
export const normalizeFileExtension = normalizedExtension;

/** Convert a scaffold name into a safe PascalCase identifier. */
export { normalizedIdentifier as normalizeName } from '../core/generated';