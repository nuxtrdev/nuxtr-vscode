import { extensions } from 'vscode';
import { existsSync, move, mkdirSync, readdirSync, removeSync } from 'fs-extra';
import { join, resolve } from 'pathe';
import { homedir } from 'os';
import { nuxtrConfiguration } from '../utils';
import { injectSnippets } from './utils'
import nuxtSinppets from './sources/nuxt'
import nitroSnippets from './sources/nitro'

enum SnippetSource {
    nuxt = 'Nuxt',
    nitro = 'Nitro',
}

const homeDir = homedir()
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


export async function activateSnippets() {
    await injectSnippets(nuxtSinppets.components, 'vue')
    await injectSnippets(nuxtSinppets.components, 'html')
    await injectSnippets(nuxtSinppets.composables, 'javascript')
    await injectSnippets(nuxtSinppets.composables, 'typescript')
    await injectSnippets(nuxtSinppets.tags, 'vue')
    await injectSnippets(nuxtSinppets.tags, 'html')
    await injectSnippets(nuxtSinppets.utils, 'javascript')
    await injectSnippets(nuxtSinppets.utils, 'typescript')
    await injectSnippets(nitroSnippets, 'typescript')
    await injectSnippets(nitroSnippets, 'javascript')
}