import { window } from 'vscode'
import { unoCSSConfig, windiCSSConfig, tailwindCSSFile, tailwindCSSJSConfig, tailwindCSSTSConfig, vuetifyConfigFile } from '../templates'
import { isNuxtTwo, createFile, projectSrcDirectory, runCommand, openExternalLink, addNuxtModule, getInstallationCommand, projectRootDirectory } from '../utils'

const frameworks = ['TailwindCSS', 'WindiCSS', 'UnoCSS', 'Vuetify']

enum TailwindOptions {
    installModule = 'Install @nuxtjs/tailwindcss module and add it to nuxt config',
    createConfigFile = 'Create TailwindCSS config file',
    createTailwindCSSFile = 'Create tailwind.css file inside assets/css',
}

enum WindiOptions {
    installModule = 'Install nuxt-windicss module and add it to nuxt config',
    createConfigFile = 'Create WindiCSS config file',
}

enum UnoCSSOptions {
    installModule = 'Install unocss/nuxt module and add it to nuxt config',
    createConfigFile = 'Create uno.config.ts file',
}

enum VuetifyOptions {
    installModule = 'Install @nuxtjs/vuetify module and add it to nuxt config',
    createConfigFile = 'Create vuetify.options.js file',
}

function configureCSS() {
    window
        .showQuickPick(frameworks, {
            canPickMany: false,
            placeHolder: 'Select CSS Framework',
        })
        .then((selection) => {
            if (selection === 'TailwindCSS') {
                configureTailwind()
            } else if (selection === 'WindiCSS') {
                configureWindi()
            } else if (selection === 'UnoCSS') {
                configureUno()
            } else if (selection === 'Vuetify') {
                configureVuetify()
            }
        })
}

const configureTailwind = () => {
    try {

        const tailwindOptions = Object.values(TailwindOptions)

        window
            .showQuickPick(tailwindOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(TailwindOptions.installModule)) {
                        const moduleName = '@nuxtjs/tailwindcss'
                        const tailwindCommand = await getInstallationCommand('tailwindcss', true)
                        const moduleCommand = await getInstallationCommand(moduleName, true)

                        if (!isNuxtTwo()) {
                            await runCommand({
                                command: tailwindCommand,
                                message: 'Installing TailwindCSS',
                                successMessage: 'TailwindCSS installed successfully',
                                errorMessage: 'TailwindCSS installation failed',
                            })
                        }

                        await runCommand({
                            command: moduleCommand,
                            message: 'Installing TailwindCSS Module',
                            successMessage: 'TailwindCSS Module installed successfully',
                            errorMessage: 'TailwindCSS Module installation failed',
                        })
                        await addNuxtModule(moduleName)
                    }

                    if (selections.includes(TailwindOptions.createTailwindCSSFile)) {
                        const filePath = `${await projectSrcDirectory()}/assets/css/tailwind.css`

                        await createFile({
                            fileName: `tailwind.css`,
                            content: tailwindCSSFile,
                            fullPath: filePath,
                        })
                    }

                    if (selections.includes(TailwindOptions.createConfigFile)) {

                        await createFile({
                            fileName: `tailwind.config.${isNuxtTwo() ? 'js' : 'ts'}`,
                            content: isNuxtTwo() ? tailwindCSSJSConfig : tailwindCSSTSConfig,
                            fullPath: `${projectRootDirectory()}/tailwind.config.${isNuxtTwo() ? 'js' : 'ts'}`,
                        })
                    }

                    window
                        .showInformationMessage('TailwindCSS configured successfully.', 'Open documentation')
                        .then((value) => {
                            if (value) {
                                openExternalLink('https://tailwindcss.nuxtjs.org/')
                            }
                        })
                }
            })
    } catch (error: any) {
        console.log(error)
    }
}

const configureWindi = async () => {
    try {
        const filePath = `${await projectSrcDirectory()}/windi.config.${isNuxtTwo() ? 'js' : 'ts'}`

        const windiOptions = Object.values(WindiOptions)

        window
            .showQuickPick(windiOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(WindiOptions.installModule)) {
                        const moduleName = 'nuxt-windicss'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing WindiCSS',
                            successMessage: 'WindiCSS installed successfully',
                            errorMessage: 'WindiCSS installation failed',
                        })

                        await addNuxtModule(moduleName)
                    }

                    if (selections.includes(WindiOptions.createConfigFile)) {
                        await createFile({
                            fileName: `windi.config.${isNuxtTwo() ? 'js' : 'ts'}`,
                            content: windiCSSConfig,
                            fullPath: filePath,
                        })
                        window
                            .showInformationMessage('WindiCSS configured successfully.', 'Open documentation')
                            .then((value) => {
                                if (value) {
                                    openExternalLink('https://windicss.org/integrations/nuxt.html')
                                }
                            })
                    }
                }
            })
    } catch (error: any) {
        console.log(error)
    }
}

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

                        await addNuxtModule(moduleName)
                    }

                    if (selections.includes(UnoCSSOptions.createConfigFile)) {
                        await createFile({
                            fileName: `uno.config.ts`,
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

const configureVuetify = async () => {
    try {
        const filePath = `${await projectSrcDirectory()}/vuetify.options.js`

        const vuetifyOptions = Object.values(VuetifyOptions)

        window
            .showQuickPick(vuetifyOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(VuetifyOptions.installModule)) {
                        const moduleName = '@nuxtjs/vuetify'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing Vuetify',
                            successMessage: 'Vuetify installed successfully',
                            errorMessage: 'Vuetify installation failed',
                        })

                        await addNuxtModule(moduleName)
                    }

                    if (selections.includes(VuetifyOptions.createConfigFile)) {
                        await createFile({
                            fileName: `vuetify.options.js`,
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
