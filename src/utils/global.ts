import { exec } from 'child_process';
import { env, Uri, Webview, workspace, window, ProgressLocation, ThemeIcon } from 'vscode';
import type { WorkspaceConfiguration } from 'vscode';
import { hasSrcDir } from './nuxt';
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
    const configuration = getConfiguration().monorepoMode.DirectoryName;
    const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!workspaceFolder) {
        throw new Error('Workspace folder not found');
    }

    if (configuration) {
        return `${workspaceFolder}/${configuration}`;
    }

    return workspaceFolder;
};


export const projectSrcDirectory = (): string => {
    const projectRootDir = projectRootDirectory();
    const srcDir = hasSrcDir();
    return srcDir === '/' ? projectRootDir : projectRootDir + srcDir;
};

export const openExternalLink = (url: string) => {
    env.openExternal(Uri.parse(url));
};

export const getConfiguration = (): NuxtrConfiguration => {
    const configuration: WorkspaceConfiguration = workspace.getConfiguration('nuxtr');
    return configuration as unknown as NuxtrConfiguration;
};


export const newTerminal = (terminalName: string, command: string, cwd?: string) => {
    const terminal = window.createTerminal({
        name: terminalName,
        cwd: cwd,
        iconPath: new ThemeIcon('nuxt-logo'),
    });

    terminal.sendText(command);

    terminal.show();
};

export const runCommand = async (args: {
    command: string
    message: string
    successMessage: string
    errorMessage: string
    // logger boolean default false
    logger?: boolean
}) => {
    await window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: args.message,
            cancellable: false,
        },
        async () => {
            return new Promise((resolve, reject) => {
                const child = exec(
                    args.command,
                    { cwd: projectRootDirectory() },
                    (error: any, stdout: any, stderr: any) => {
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
                        window.showInformationMessage(args.successMessage);
                    } else {
                        window.showErrorMessage(args.errorMessage);
                    }
                });
            });
        }
    );
};
