/** Offer CSS framework setup using recipes that align installed packages, CSS and Nuxt configuration. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { configureTailwindSource, tailwindRecipe } from '../core/tailwind';
import { findNuxtConfig, projectDirectory } from '../utils/nuxt';
import { window } from 'vscode'
import { tailwindCSSFile, tailwindCSSJSConfig, tailwindCSSTSConfig, unoCSSConfig, vuetifyConfigFile } from '../templates'
import { createFile, getInstallationCommand, isNuxtTwo, openExternalLink, projectRootDirectory, projectSrcDirectory, runCommand, updateNuxtConfig } from '../utils'

const frameworks = ['TailwindCSS', 'UnoCSS', 'Vuetify']

enum UnoCSSOptions {
    installModule = 'Install @UnoCSS/Nuxt module and add it to nuxt config',
    createConfigFile = 'Create UnoCSS config file',
}

enum VuetifyOptions {
    installModule = 'Install vuetify-nuxt-module module and add it to nuxt config',
    createConfigFile = 'Create Vuetify config file',
}

/** Prompt for a framework and start its project-specific setup. */
function configureCSS () {
    window
        .showQuickPick(frameworks, {
            canPickMany: false,
            placeHolder: 'Select CSS Framework',
        })
        .then((selection) => {
            switch (selection) {
                case 'TailwindCSS': {
                    configureTailwind()

                    break;
                }
                case 'UnoCSS': {
                    configureUno()

                    break;
                }
                case 'Vuetify': {
                    configureVuetify()
                    break;
                }
            }
        })
}

/** Offer explicit Tailwind 4/Vite or legacy Tailwind 3/module setup without overwriting user CSS/config files. */
const configureTailwind = async () => {
    try {
        const selected = await window.showQuickPick(isNuxtTwo() ? ['Tailwind 3 (Nuxt module)'] : ['Tailwind 4 (Vite)', 'Tailwind 3 (Nuxt module)'], { placeHolder: 'Select a Tailwind integration' });
        if (!selected) { return; }
        const recipe = selected.startsWith('Tailwind 4') ? 'vite4' : 'module3';
        const definition = tailwindRecipe(recipe);
        const path = findNuxtConfig();
        if (!path) { throw new Error('No Nuxt configuration found.'); }
        const cssPath = join(projectDirectory('assets'), 'css/tailwind.css');
        if (existsSync(cssPath) && readFileSync(cssPath, 'utf8') !== definition.css) { throw new Error(`Existing ${cssPath} has custom content. Preserve it and apply the recipe manually.`); }
        const alias = '~/' + relative(projectDirectory('app'), cssPath).replaceAll('\\', '/');
        const original = readFileSync(path, 'utf8');
        const updated = configureTailwindSource(original, recipe, alias);
        const command = await getInstallationCommand(definition.packages.join(' '), true);
        await runCommand({ command, message: `Installing ${selected}`, successMessage: 'Tailwind dependencies installed', errorMessage: 'Tailwind dependency installation failed', logger: true });
        if (readFileSync(path, 'utf8') !== original) { throw new Error('Nuxt config changed during installation. Packages are installed; apply configuration manually.'); }
        if (!existsSync(cssPath)) { await createFile({ fileName: 'tailwind.css', content: definition.css, fullPath: cssPath }); }
        writeFileSync(path, updated, 'utf8');
        if (recipe === 'module3' && !existsSync(join(projectRootDirectory(), 'tailwind.config.ts'))) {
            const filename = `tailwind.config.${isNuxtTwo() ? 'js' : 'ts'}`;
            if (!existsSync(join(projectRootDirectory(), filename))) { await createFile({ fileName: filename, content: isNuxtTwo() ? tailwindCSSJSConfig : tailwindCSSTSConfig, fullPath: join(projectRootDirectory(), filename) }); }
        }
        window.showInformationMessage(`${selected} configured.`);
    } catch (error) { window.showErrorMessage(String(error)); }
};

/** Offer UnoCSS module installation and preserve its existing configuration. */
const configureUno = async () => {
    try {
        const filePath = `${await projectSrcDirectory()}/uno.config.ts`

        const unoCSSOptions = Object.values(UnoCSSOptions)

        window
            .showQuickPick(unoCSSOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(UnoCSSOptions.installModule)) {
                        const moduleName = '@unocss/nuxt'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing UnoCSS',
                            successMessage: 'UnoCSS installed successfully',
                            errorMessage: 'UnoCSS installation failed',
                        })

                        await updateNuxtConfig('add-module', moduleName)
                    }

                    if (selections.includes(UnoCSSOptions.createConfigFile)) {
                        await createFile({
                            fileName: 'uno.config.ts',
                            content: unoCSSConfig,
                            fullPath: filePath,
                        })
                        window
                            .showInformationMessage('UnoCSS configured successfully.', 'Open documentation')
                            .then((value) => {
                                if (value) {
                                    openExternalLink('https://unocss.dev/')
                                }
                            })
                    }
                }
            })
    } catch (error: any) {
        console.log(error)
    }
}

/** Offer Vuetify module installation and preserve its existing configuration. */
const configureVuetify = async () => {
    try {
        const filePath = `${await projectSrcDirectory()}/vuetify.config.ts`

        const vuetifyOptions = Object.values(VuetifyOptions)

        window
            .showQuickPick(vuetifyOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(VuetifyOptions.installModule)) {
                        const moduleName = 'vuetify-nuxt-module'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing Vuetify',
                            successMessage: 'Vuetify installed successfully',
                            errorMessage: 'Vuetify installation failed',
                        })

                        await updateNuxtConfig('add-module', moduleName)
                    }

                    if (selections.includes(VuetifyOptions.createConfigFile)) {
                        await createFile({
                            fileName: 'vuetify.config.ts',
                            content: vuetifyConfigFile,
                            fullPath: filePath,
                        })
                        window
                            .showInformationMessage('Vuetify configured successfully.', 'Open documentation')
                            .then((value) => {
                                if (value) {
                                    openExternalLink('https://github.com/nuxt-community/vuetify-module')
                                }
                            })
                    }
                }
            })
    } catch (error) {
        console.log(error);
    }
}

export { configureCSS }
