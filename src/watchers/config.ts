import { Disposable, window, commands } from 'vscode';
import { createConfigWatcher, nuxtrConfiguration, getProjectDependencies, projectRootDirectory } from '../utils';
import { existsSync } from 'fs';
import { toggleSnippets } from '../snippets';
import { TSConfigNuxt } from '../types';
import { readTSConfig } from 'pkg-types'
import nuxtrCommands from '../commands'
import { PugConfigurationSteps } from '../commands/Templates'


export const snippetsConfigWatcher: Disposable = createConfigWatcher('nuxtr.snippets', async () => {
    await toggleSnippets()
    return Promise.resolve();
});

export const templatesConfigWatcher: Disposable = createConfigWatcher('nuxtr.vueFiles.template.defaultLanguage', async () => {
    const options: string[] = [];

    const dependencies = await getProjectDependencies();

    if (nuxtrConfiguration().vueFiles.template.defaultLanguage === 'pug') {
        const pugDependency = dependencies.find(dep => dep.name === 'pug');

        if (!pugDependency) {
            options.push(PugConfigurationSteps.installPug);
        }

        const languagePluginPugDependency = dependencies.find(dep => dep.name === '@vue/language-plugin-pug');

        if (!languagePluginPugDependency) {
            options.push(PugConfigurationSteps.installLanguagePlugin);
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


export const piniaConfigWatcher: Disposable = createConfigWatcher('nuxtr.piniaFiles', async () => {
    const question = window.showInformationMessage('Pinia Configuration has been modified.', 'Reload Window')

    question.then((answer) => {
        if (answer === 'Reload Window') {
            commands.executeCommand('workbench.action.reloadWindow');
        }
    })
});
