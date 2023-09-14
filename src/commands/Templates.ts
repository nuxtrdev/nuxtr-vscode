import { window } from 'vscode'
import { existsSync } from 'fs'
import { projectRootDirectory, runCommand, getInstallationCommand } from '../utils'
import type { TSConfigNuxt } from '../types'
import { writeTSConfig, readTSConfig } from 'pkg-types'

export enum PugConfigurationSteps {
    installPug = 'Install Pug',
    installLanguagePlugin = 'Install @vue/language-plugin-pug',
    addPluginToTSConfig = 'Add @vue/language-plugin-pug to tsconfig.json',
}

const defaultOptions = Object.values(PugConfigurationSteps)


export const configurePug = (options: string[] = defaultOptions) => {
    try {
        window
            .showQuickPick(options, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(PugConfigurationSteps.installPug)) {
                        const moduleName = 'pug'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing Pug',
                            successMessage: 'Pug installed successfully',
                            errorMessage: 'Pug installation failed',
                        })
                    }

                    if (selections.includes(PugConfigurationSteps.installLanguagePlugin)) {
                        const moduleName = '@vue/language-plugin-pug'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing @vue/language-plugin-pug',
                            successMessage: '@vue/language-plugin-pug installed successfully',
                            errorMessage: '@vue/language-plugin-pug installation failed',
                        })
                    }

                    if (selections.includes(PugConfigurationSteps.addPluginToTSConfig)) {
                        const path = `${projectRootDirectory()}/tsconfig.json`;

                        if (!existsSync(path)) {
                            return;
                        }

                        let tsconfig: TSConfigNuxt = await readTSConfig(path);
                        tsconfig.vueCompilerOptions = {
                            plugins: [
                                '@vue/language-plugin-pug'
                            ]
                        }

                        await writeTSConfig(path, tsconfig)

                        window.showInformationMessage('Pug is added to tsconfig.json')
                    }
                }
            })
    } catch (error) {
        console.error(error)
    }
}