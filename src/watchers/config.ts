import { Disposable, window } from 'vscode';
import { createConfigWatcher, getConfiguration, getProjectDependencies, projectRootDirectory } from '../utils';
import { existsSync } from 'fs';
import { toggleSnippets } from '../snippets';
import { TSConfigNuxt } from '../types';
import { readTSConfig } from 'pkg-types'
import nuxtrCommands from '../commands'
import { PugConfigurationSteps } from '../commands/Templates'


const watcherDefaultBehavior = false
const dependencies = getProjectDependencies() as unknown as Array<string>;

export const snippetsConfigWatcher: Disposable = createConfigWatcher('nuxtr.snippets', async () => {
    console.log('snippets', getConfiguration().snippets);
    await toggleSnippets()
    return Promise.resolve();
});

export const templatesConfigWatcher: Disposable = createConfigWatcher('nuxtr.vueFiles.template.defaultLanguage', async () => {
    const options: string[] = [];

    if (getConfiguration().vueFiles.template.defaultLanguage === 'pug') {


        if (!dependencies.includes('pug')) {
            options.push(PugConfigurationSteps.installPug)
        }

        if (!dependencies.includes('@vue/language-plugin-pug')) {
            options.push(PugConfigurationSteps.installLanguagePlugin)
        }

        const path = `${projectRootDirectory()}/tsconfig.json`;
        let tsconfig: TSConfigNuxt = await readTSConfig(path);

        if (!existsSync(path)) {
            return;
        }

        const vueCompilerPlugins: string[] = tsconfig.vueCompilerOptions?.plugins ?? [];
        if (!vueCompilerPlugins.includes('@vue/language-plugin-pug')) {
            options.push(PugConfigurationSteps.addPluginToTSConfig)
        }


        if (options.length > 0) {
            const question = window.showInformationMessage('Pug is not configured properly', 'Configure Pug')
            question.then((answer) => {
                if (answer === 'Configure Pug') {
                    nuxtrCommands.configurePug(options);
                }
            })


        }
    }
});
