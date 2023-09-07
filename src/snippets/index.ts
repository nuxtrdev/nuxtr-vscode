import { extensions } from 'vscode';
import * as os from 'os';
import { existsSync, move, mkdirSync, readdirSync, removeSync } from 'fs-extra';
import { join, resolve } from 'path';
import { getConfiguration } from '../utils';

export enum SnippetSource {
    nuxt = 'Nuxt',
}

const homeDir = os.homedir()
const snippetsConfigurations = getConfiguration().snippets

const snippetsDir = 'snippets'
const disabledSnippetsDir = 'disabled_snippets'
const extensionName = 'nuxtr.nuxtr-vscode'
const nuxtrVersion = extensions.getExtension(extensionName)?.packageJSON.version
let extensionDir = resolve(homeDir, '.vscode', 'extensions', `${extensionName}-${nuxtrVersion}`)

async function manageSnippetState(snippetSource: string) {
    const snippetSourceDir = join(extensionDir, snippetsDir, snippetSource);
    const disabledSnippetSourceDir = join(extensionDir, disabledSnippetsDir, snippetSource);

    if (!existsSync(disabledSnippetSourceDir)) {
        mkdirSync(disabledSnippetSourceDir, { recursive: true });
    }

    if (!snippetsConfigurations.nuxt) {
        const files = readdirSync(disabledSnippetSourceDir);
        for (const file of files) {
            await move(join(disabledSnippetSourceDir, file), join(snippetSourceDir, file));
        }

        removeSync(disabledSnippetSourceDir);
    } else {
        const files = readdirSync(snippetSourceDir);
        for (const file of files) {
            await move(join(snippetSourceDir, file), join(disabledSnippetSourceDir, file));
        }

        removeSync(snippetSourceDir);
    }
}


export const toggleSnippets = async (dir: string) => {
    await manageSnippetState(SnippetSource.nuxt);
}
