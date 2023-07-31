import { window } from 'vscode'
import {
    isNuxtTwo,
    createFile,
    projectSrcDirectory,
    runCommand,
    openExternalLink,
    addNuxtModule,
    getInstallationCommand,
} from '../utils'
import {
    unoCSSConfig,
    windiCSSConfig,
    tailwindCSSFile,
    tailwindCSSConfig,
    vuetifyConfigFile,
} from '../templates/css'

const frameworks = ['TailwindCSS', 'WindiCSS', 'UnoCSS', 'Vuetify']

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
        const tailwindOptions = [
            'Install @nuxtjs/tailwindcss module and add it to nuxt config',
            'Create TailwindCSS config file',
            'Create tailwind.css file inside assets/css',
        ]

        window
            .showQuickPick(tailwindOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes('Install @nuxtjs/tailwindcss module and add it to nuxt config')) {
                        const moduleName = '@nuxtjs/tailwindcss'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing TailwindCSS',
                            successMessage: 'TailwindCSS installed successfully',
                            errorMessage: 'TailwindCSS installation failed',
                        })
                        await addNuxtModule({ npm: moduleName })
                    }

                    if (selections.includes('Create tailwind.css file inside assets/css')) {
                        const filePath = `${projectSrcDirectory()}/assets/css/tailwind.css`

                        await createFile({
                            fileName: `tailwind.css`,
                            content: tailwindCSSFile,
                            fullPath: filePath,
                        })
                    }

                    if (selections.includes('Create TailwindCSS config file')) {
                        await createFile({
                            fileName: `tailwind.config.${isNuxtTwo() ? 'js' : 'ts'}`,
                            content: tailwindCSSConfig,
                            fullPath: `${projectSrcDirectory()}/tailwind.config.js`,
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
        const filePath = `${projectSrcDirectory()}/windi.config.${isNuxtTwo() ? 'js' : 'ts'}`

        const windiOptions = [
            'Install nuxt-windicss module and add it to nuxt config',
            'Create windi.config.js file',
        ]

        window
            .showQuickPick(windiOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes('Install nuxt-windicss module and add it to nuxt config')) {
                        const moduleName = 'nuxt-windicss'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing WindiCSS',
                            successMessage: 'WindiCSS installed successfully',
                            errorMessage: 'WindiCSS installation failed',
                        })

                        await addNuxtModule({ npm: moduleName })
                    }

                    if (selections.includes('Create windi.config.js file')) {
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
        const filePath = `${projectSrcDirectory()}/uno.config.ts`

        const unoCssOptions = [
            'Install unocss/nuxt module and add it to nuxt config',
            'Create uno.config.ts file',
        ]

        window
            .showQuickPick(unoCssOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes('Install unocss/nuxt module and add it to nuxt config')) {
                        const moduleName = '@unocss/nuxt'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing UnoCSS',
                            successMessage: 'UnoCSS installed successfully',
                            errorMessage: 'UnoCSS installation failed',
                        })

                        await addNuxtModule({ npm: moduleName })
                    }

                    if (selections.includes('Create uno.config.ts file')) {
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
        const filePath = `${projectSrcDirectory()}/vuetify.options.js`

        const vuetifyOptions = [
            'Install @nuxtjs/vuetify module and add it to nuxt config',
            'Create vuetify.options.js file',
        ]

        window
            .showQuickPick(vuetifyOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes('Install @nuxtjs/vuetify module and add it to nuxt config')) {
                        const moduleName = '@nuxtjs/vuetify'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing Vuetify',
                            successMessage: 'Vuetify installed successfully',
                            errorMessage: 'Vuetify installation failed',
                        })

                        await addNuxtModule({ npm: moduleName })
                    }

                    if (selections.includes('Create vuetify.options.js file')) {
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
    } catch (error) { }
}

export { configureCSS }
