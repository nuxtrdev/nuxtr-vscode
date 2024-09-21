import { existsSync } from 'node:fs';
import { readTSConfig } from 'pkg-types';
import { Disposable, commands, window } from 'vscode';
import nuxtrCommands from '../commands';
import { PugConfigurationSteps } from '../commands/templates';
import { toggleSnippets } from '../snippets';
import { TSConfigNuxt } from '../types';
import { createConfigWatcher, getProjectDependencies, nuxtrConfiguration, projectRootDirectory } from '../utils';

const reloatWindowProps = () => {
    window.showInformationMessage('Configuration has been modified.', 'Reload Window').then((answer) => {
        if (answer === 'Reload Window') {
            commands.executeCommand('workbench.action.reloadWindow');
            return;
        }
    });
}

export const nuxtSnippetsConfigWatcher: Disposable =
  createConfigWatcher('nuxtr.snippets.nuxt', async () => {
      await toggleSnippets('Nuxt', nuxtrConfiguration().snippets.nuxt)
      reloatWindowProps();
  });

export const nitroSnippetsConfigWatcher: Disposable =
  createConfigWatcher('nuxtr.snippets.nitro', async () => {
      await toggleSnippets('Nitro', nuxtrConfiguration().snippets.nitro)
      reloatWindowProps();
  })

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
        const tsconfig: TSConfigNuxt = await readTSConfig(path);

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

export const intellisenseConfigWatcher: Disposable = createConfigWatcher('nuxtr.intellisense', (): Promise<void> => {
    reloatWindowProps();
    return Promise.resolve();
})