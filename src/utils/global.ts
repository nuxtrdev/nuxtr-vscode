import { ProgressLocation, ThemeIcon, Uri, Webview, env, window, workspace } from 'vscode';
import type { WorkspaceConfiguration } from 'vscode';
import { exec } from 'node:child_process';
import { hasSrcDir } from './nuxt';
import { installDependencies } from '../commands/InstallDependencies'
import { logger } from './outputChannel';
import type { NuxtrConfiguration } from '../types';

export const getNonce = () => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

export const getUri = (webview: Webview, extensionUri: Uri, pathList: string[]) => {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
};

export const projectRootDirectory = (): string => {
    const configuration = nuxtrConfiguration().monorepoMode.DirectoryName;
    const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!workspaceFolder) {
        throw new Error('Workspace folder not found');
    }

    if (configuration) {
        return `${workspaceFolder}/${configuration}`;
    }

    return workspaceFolder;
};


export const projectSrcDirectory = async (): Promise<string> => {
    const projectRootDir = projectRootDirectory();
    const srcDir = await hasSrcDir();
    return srcDir === '/' ? projectRootDir : projectRootDir + srcDir;
};

export const openExternalLink = (url: string) => {
    env.openExternal(Uri.parse(url));
};

export const nuxtrConfiguration = (): NuxtrConfiguration => {
    const configuration: WorkspaceConfiguration = workspace.getConfiguration('nuxtr');
    return configuration as unknown as NuxtrConfiguration;
};

export const vscodeConfiguration = (): WorkspaceConfiguration => {
    return workspace.getConfiguration();
}

export const newTerminal = (terminalName: string, command: string, cwd?: string) => {
    const existingTerminal = window.terminals.find(terminal => terminal.name === terminalName);

    if (existingTerminal) {
        existingTerminal.show();
        existingTerminal.sendText(command);
    } else {
        const terminal = window.createTerminal({
            name: terminalName,
            cwd,
            iconPath: new ThemeIcon('nuxt-logo'),
        });

        terminal.sendText(command);
        terminal.show();
    }
};


export const runCommand = async (args: {
    command: string
    message: string
    successMessage: string
    errorMessage: string
    docsURL?: string
    // logger boolean default false
    logger?: boolean
}) => {
    await window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: args.message,
            cancellable: false,
        },
        () => {
            return new Promise((resolve, reject) => {
                const child = exec(
                    args.command,
                    { cwd: projectRootDirectory() },
                    (error: any, stdout: any) => {
                        if (error) {
                            reject(error.message);
                        } else {
                            if (args.logger) {
                                logger.log(stdout);
                                logger.show();
                            }
                            resolve(stdout);
                        }
                    }
                );

                child.on('exit', async (code) => {
                    if (code === 0) {
                        if (args.docsURL) {
                            const response = await window.showInformationMessage(args.successMessage, 'Open documentation');
                            if (response === 'Open documentation') {
                                openExternalLink(args.docsURL);
                            }
                        } else {
                            window.showInformationMessage(args.successMessage);
                        }

                    } else {
                        window.showErrorMessage(args.errorMessage);
                    }
                });
            });
        }
    );
};


const _jiti = require("jiti")(projectRootDirectory(), { esmResolve: true, interopDefault: true });

export async function tryImport (path: string): Promise<undefined | unknown> {
    try {
        return _jiti(path)
    } catch {
        const response = await window.showErrorMessage(
            'Dependencies are not installed. Install dependencies first?',
            'Install',
            'Close'
        )

        if (response === 'Install') {
            installDependencies()
        }
        return undefined;
    }
}
