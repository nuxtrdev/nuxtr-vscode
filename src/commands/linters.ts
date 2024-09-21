import { writeFileSync } from 'node:fs'
import { ConfigurationTarget, window, workspace } from 'vscode'
import { eslintConfig, stylelintConfig, stylelintIgnore } from '../templates'
import { createFile, getInstallationCommand, injectPkgJSONScript, openExternalLink, projectRootDirectory, runCommand, updateNuxtConfig } from '../utils'
const frameworks = ['Eslint', 'Stylelint']

enum StylelintOptions {
    installModule = 'Install Stylelint & Stylelint module',
    addScriptToPackageJSON = 'Add lint script to package.json',
    createStyleLintAndIgnoreFiles = 'Create .stylelintrc & .stylelintignore files',
}

function configureLinters () {
    window
        .showQuickPick(frameworks, {
            canPickMany: false,
            placeHolder: 'Select Linter',
        })
        .then((selection) => {
            if (selection === 'Eslint') {
                configureEslint()
            }

            if (selection === 'Stylelint') {
                configureStylelint()
            }
        })
}

const configureEslint = async () => {
    const packages = { eslint: 'eslint', module: '@nuxt/eslint', }
    const eslintCommand = await getInstallationCommand(packages.eslint, true)
    const moduleCommand = await getInstallationCommand(packages.module, true)
    const devServerCheckerCommand = await getInstallationCommand('vite-plugin-eslint2', true)

    await runCommand({
        command: eslintCommand,
        message: 'Installing Eslint',
        successMessage: 'Eslint installed successfully',
        errorMessage: 'Eslint installation failed',
    })

    await runCommand({
        command: moduleCommand,
        message: `Installing ${packages.module} module`,
        successMessage: `${packages.module} installed successfully`,
        errorMessage: `${packages.module} installation failed`,
        docsURL: 'https://eslint.nuxt.com'
    })

    await updateNuxtConfig('add-module', '@nuxt/eslint')


    const scriptName = 'lint'
    const script = 'eslint  .'
    await injectPkgJSONScript(scriptName, script)

    await createFile({
        fileName: 'eslint.config.mjs',
        content: eslintConfig,
        fullPath: `${projectRootDirectory()}/eslint.config.mjs`
    })

    const config = workspace.getConfiguration('eslint')
    config.update('useFlatConfig', true, ConfigurationTarget.Workspace)
    window.showInformationMessage('Eslint useFlagConfig enabled successfully')


    const devServerChecker = await window.showInformationMessage(
        'Eslint configured successfully, do you want to configure Dev Server Checker?',
        'Yes',
        'Learn More'
    )

    if (devServerChecker === 'Yes') {
        await runCommand({
            command: devServerCheckerCommand,
            message: 'Installing vite-plugin-eslint2 module',
            successMessage: 'vite-plugin-eslint2 installed successfully',
            errorMessage: 'vite-plugin-eslint2 installation failed',
        })

        await updateNuxtConfig('inject-eslint-devChcker')
    }

    if (devServerChecker === 'Learn More') {
        openExternalLink('https://eslint.nuxt.com/packages/module#dev-server-checker')
    }

}

const configureStylelint = () => {
    const stylelintOptions = Object.values(StylelintOptions)

    window
        .showQuickPick(stylelintOptions, {
            canPickMany: true,
            placeHolder: 'Select files to create',
        })
        .then(async (selections) => {
            if (selections !== undefined && selections.length > 0) {
                if (selections.includes(StylelintOptions.installModule)) {

                    const moduleName = 'stylelint @nuxtjs/stylelint-module stylelint-config-recommended-vue'
                    const command = await getInstallationCommand(moduleName, true)

                    await runCommand({
                        command,
                        message: 'Installing stylelint, @nuxtjs/stylelint-module, stylelint-config-recommended-vue modules',
                        successMessage: 'stylelint, @nuxtjs/stylelint-module, stylelint-config-recommended-vue modules installed successfully',
                        errorMessage: 'stylelint, @nuxtjs/stylelint-module, stylelint-config-recommended-vue modules installation failed',
                    })

                }

                if (selections.includes(StylelintOptions.addScriptToPackageJSON)) {
                    const packageJsonPath = `${projectRootDirectory()}/package.json`
                    const packageJson = require(packageJsonPath)

                    packageJson.scripts.stylelint = 'stylelint --fix --allow-empty-input --ignore-path .gitignore .'

                    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
                }

                if (selections.includes(StylelintOptions.createStyleLintAndIgnoreFiles)) {
                    const stylelintPath = `${projectRootDirectory()}/.stylelintrc`
                    const stylelintIgnorePath = `${projectRootDirectory()}/.stylelintignore`

                    await createFile({
                        fileName: '.stylelintignore',
                        content: stylelintIgnore,
                        fullPath: stylelintIgnorePath,
                    })

                    await createFile({
                        fileName: '.stylelintrc',
                        content: stylelintConfig,
                        fullPath: stylelintPath,
                    })
                }
            }
        })
}

export { configureLinters }
