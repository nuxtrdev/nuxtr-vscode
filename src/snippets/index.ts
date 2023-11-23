import { extensions } from 'vscode';
import * as os from 'os';
import { existsSync, move, mkdirSync, readdirSync, removeSync } from 'fs-extra';
import { join, resolve } from 'pathe';
import { nuxtrConfiguration } from '../utils';

export enum SnippetSource {
    nuxt = 'Nuxt',
    nitro = 'Nitro',
}

const homeDir = os.homedir()
const snippetsConfigurations = nuxtrConfiguration().snippets

const snippetsDir = 'snippets'
const disabledSnippetsDir = 'disabled_snippets'
const extensionName = 'nuxtr.nuxtr-vscode'
const nuxtrVersion = extensions.getExtension(extensionName)?.packageJSON.version
let extensionDir = resolve(homeDir, '.vscode', 'extensions', `${extensionName}-${nuxtrVersion}`)

async function manageSnippetState(snippetSource: string, snippetConfig: boolean) {
    const snippetSourceDir = join(extensionDir, snippetsDir, snippetSource);
    const disabledSnippetSourceDir = join(extensionDir, disabledSnippetsDir, snippetSource);

    if (!existsSync(disabledSnippetSourceDir)) {
        mkdirSync(disabledSnippetSourceDir, { recursive: true });
    }

    if (!snippetConfig) {
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


export const toggleSnippets = async () => {
    await manageSnippetState(SnippetSource.nuxt, snippetsConfigurations.nuxt);
    await manageSnippetState(SnippetSource.nitro, snippetsConfigurations.nitro);
}
