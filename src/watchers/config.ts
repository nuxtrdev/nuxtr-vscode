import { Disposable } from 'vscode';
import { createConfigWatcher, getConfiguration } from '../utils';
import { toggleSnippets } from '../snippets';

const snippetsConfig = getConfiguration().snippets

export const snippetsConfigWatcher: Disposable = createConfigWatcher('nuxtr.snippets', async () => {
    console.log('snippets', snippetsConfig);
    await toggleSnippets('Nuxt')
    return Promise.resolve();
});
