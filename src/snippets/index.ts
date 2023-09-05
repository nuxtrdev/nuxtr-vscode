import { extensions } from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import { join, resolve } from 'path';
import { getConfiguration } from '../utils';

const homeDir = os.homedir()
const snippetsConfigurations = getConfiguration().snippets


const snippetsDir = 'snippets'
const disabledSnippetsDir = 'disabled_snippets'
const extensionName = 'nuxtr.nuxtr-vscode'
const nuxtrVersion = extensions.getExtension(extensionName)?.packageJSON.version

export const toggleSnippets = () => {
    let extendionDir = resolve(homeDir, '.vscode', 'extensions', `${extensionName}-${nuxtrVersion}`)
    console.log('extendionDir', extendionDir);

    if (snippetsConfigurations) {
        console.log('snippetsConfigurations', snippetsConfigurations);
    }
}
