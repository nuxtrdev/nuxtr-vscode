import { window } from 'vscode'
import { createFile, projectRootDirectory, runCommand, getInstallationCommand } from '../utils'

import * as fs from 'fs'
import { eslintConfig, eslintIgnore, stylelintConfig, stylelintIgnore } from '../templates'
const frameworks = ['Eslint', 'Stylelint']

enum EslintOptions {
    installModule = 'Install Eslint module',
    addScriptToPackageJSON = 'Add lint script to package.json',
    createESLintAndIgnoreFiles = 'Create .eslintrc & .eslintignore files',
}

enum StylelintOptions {
    installModule = 'Install Stylelint & Stylelint module',
    addScriptToPackageJSON = 'Add lint script to package.json',
    createStyleLintAndIgnoreFiles = 'Create .stylelintrc & .stylelintignore files',
}

function configureLinters() {
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

const configureEslint = () => {
    try {
        const eslintOptions = Object.values(EslintOptions)

        window
            .showQuickPick(eslintOptions, {
                canPickMany: true,
                placeHolder: 'Select files to create',
            })
            .then(async (selections) => {
                if (selections !== undefined && selections.length > 0) {
                    if (selections.includes(EslintOptions.installModule)) {
                        const moduleName = '@nuxtjs/eslint-config-typescript eslint'
                        const command = await getInstallationCommand(moduleName, true)

                        await runCommand({
                            command,
                            message: 'Installing Eslint module',
                            successMessage: 'Eslint installed successfully',
                            errorMessage: 'Eslint installation failed',
                        })
                    }

                    if (selections.includes(EslintOptions.addScriptToPackageJSON)) {
                        const packageJsonPath = `${projectRootDirectory()}/package.json`
                        const packageJson = require(packageJsonPath)

                        packageJson.scripts.lint = 'eslint --ext .js,.vue,.ts,.tsx --ignore-path .gitignore .'

                        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
                    }

                    if (selections.includes(EslintOptions.createESLintAndIgnoreFiles)) {
                        const eslintPath = `${projectRootDirectory()}/.eslintrc`
                        const eslintIgnorePath = `${projectRootDirectory()}/.eslintignore`

                        await createFile({
                            fileName: `.eslintignore`,
                            content: eslintIgnore,
                            fullPath: eslintIgnorePath,
                        })

                        await createFile({
                            fileName: `.eslintrc`,
                            content: eslintConfig,
                            fullPath: eslintPath,
                        })
                    }
                }
            })
    } catch (error) {
        console.error(error)
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
                        message: `Installing stylelint, @nuxtjs/stylelint-module, stylelint-config-recommended-vue modules`,
                        successMessage: `stylelint, @nuxtjs/stylelint-module, stylelint-config-recommended-vue modules installed successfully`,
                        errorMessage: `stylelint, @nuxtjs/stylelint-module, stylelint-config-recommended-vue modules installation failed`,
                    })

                }

                if (selections.includes(StylelintOptions.addScriptToPackageJSON)) {
                    const packageJsonPath = `${projectRootDirectory()}/package.json`
                    const packageJson = require(packageJsonPath)

                    packageJson.scripts.stylelint = 'stylelint --fix --allow-empty-input --ignore-path .gitignore .'

                    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
                }

                if (selections.includes(StylelintOptions.createStyleLintAndIgnoreFiles)) {
                    const stylelintPath = `${projectRootDirectory()}/.stylelintrc`
                    const stylelintIgnorePath = `${projectRootDirectory()}/.stylelintignore`

                    await createFile({
                        fileName: `.stylelintignore`,
                        content: stylelintIgnore,
                        fullPath: stylelintIgnorePath,
                    })

                    await createFile({
                        fileName: `.stylelintrc`,
                        content: stylelintConfig,
                        fullPath: stylelintPath,
                    })
                }
            }
        })
}

export { configureLinters }
