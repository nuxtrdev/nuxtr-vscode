/** Install disposable setting watchers only during project activation. */
import { existsSync } from 'node:fs';
import { readTSConfig } from 'pkg-types';
import { ExtensionContext, commands, window } from 'vscode';
import nuxtrCommands from '../commands';
import { PugConfigurationSteps } from '../commands/templates';
import { TSConfigNuxt } from '../types';
import { createConfigWatcher, getProjectDependencies, nuxtrConfiguration, projectRootDirectory } from '../utils';

/** Register project configuration listeners and attach every listener to the extension lifetime. */
export function activateConfigWatchers (context: ExtensionContext) {

    const templatesConfigWatcher = createConfigWatcher('nuxtr.vueFiles.template.defaultLanguage', async () => {
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


            if (!existsSync(path)) {
                return;
            }

            const tsconfig: TSConfigNuxt = await readTSConfig(path);
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

    context.subscriptions.push(templatesConfigWatcher);
}
