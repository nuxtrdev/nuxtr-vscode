import { QuickPickItem, QuickPickOptions, window, commands, StatusBarItem, ExtensionContext, ProgressLocation, } from 'vscode'
import { existsSync, readFileSync, readdirSync} from 'fs'
import { exec } from 'child_process'
import { destr } from "destr"
import { getConfiguration, projectRootDirectory, runCommand } from './global'
import { installDependencies } from '../commands/InstallDependencies'
import pm from '../content/pm'
import { logger } from './outputChannel'
import { newTerminal } from '.'


const items: QuickPickItem[] = pm.map((item) => {
    return {
        label: item.name,
    }
})


export const getProjectDependencies = () => {
    let packageJsonPath = `${projectRootDirectory()}/package.json`

    if (!existsSync(packageJsonPath)) {
        return
    } else {
        let packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

        let dependencies = []

        if (packageJson.dependencies) {
            dependencies.push(
                ...Object.keys(packageJson.dependencies).map((key) => {
                    return {
                        name: key,
                        version: packageJson.dependencies[key],
                    }
                })
            )
        }
        if (packageJson.devDependencies) {
            dependencies.push(
                ...Object.keys(packageJson.devDependencies).map((key) => {
                    return {
                        name: key,
                        version: packageJson.devDependencies[key],
                    }
                })

            )
        }

        return dependencies
    }
}

export const getOutdatedPackages = async () => {
    const packageManager = detectPackageManagerByName()

    let checkingVersionCommand: string = ''


    let pm = packageManager && packageManager.name === 'pnpm' ? 'pnpm' : 'npm'
    checkingVersionCommand = `${pm} outdated --json`


    logger.log(checkingVersionCommand)
    const child = exec(
        checkingVersionCommand,
        { cwd: projectRootDirectory() },
        (error: any, stdout: any, stderr: any) => {
            const outdatedDependencies = destr(stdout)
            return outdatedDependencies
        }
    )

    // use await here to wait for the result of the exec function
    const result = await new Promise((resolve, reject) => {
        child.stdout?.on('data', (data) => {
            resolve(data)
        })
    }
    )

    return result
}

export const getProjectScripts = () => {
    let packageJsonPath = `${projectRootDirectory()}/package.json`

    if (!existsSync(packageJsonPath)) {
        return
    } else {
        let packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
        let scripts = {
            ...packageJson.scripts,
        }
        return scripts
    }
}

export const areDependenciesInstalled = () => {
    let packageJsonPath = `${projectRootDirectory()}/package.json`
    let nodeModulesPath = `${projectRootDirectory()}/node_modules`
    if (!existsSync(packageJsonPath)) {
        return
    } else if (!existsSync(nodeModulesPath)) {
        return false
    } else {
        return true
    }
}

export const detectPackageManagerByName = () => {
    const projectDirectory = readdirSync(`${projectRootDirectory()}`)

    if (projectDirectory.includes('package-lock.json')) {
        return {
            name: 'NPM',
            lockFile: 'package-lock.json',
            installCommand: 'npm install',
            uninstallCommand: 'npm uninstall',
        }
    }

    if (projectDirectory.includes('yarn.lock')) {
        return {
            name: 'Yarn',
            lockFile: 'yarn.lock',
            installCommand: 'yarn add',
            uninstallCommand: 'yarn remove',
        }
    }

    if (projectDirectory.includes('pnpm-lock.yaml')) {
        return {
            name: 'pnpm',
            lockFile: 'pnpm-lock.yaml',
            installCommand: 'pnpm install',
            uninstallCommand: 'pnpm remove',
        }
    }

    if (projectDirectory.includes('bun.lockb')) {
        return {
            name: 'Bun',
            lockFile: 'bun.lockb',
            installCommand: 'bun install',
            uninstallCommand: 'bun remove',
        }
    }

    return undefined
}

export const getInstallationCommand = async (packageName: string, devFlag: boolean) => {
    const packageManager = detectPackageManagerByName()

    const defaultPackageManager = getConfiguration().defaultPackageManager

    const installationCommand: any = {
        Yarn: `yarn add ${packageName} ${devFlag ? '-D' : ''}`,
        NPM: `npm install ${packageName} ${devFlag ? '-D' : ''}`,
        pnpm: `pnpm add ${packageName} ${devFlag ? '-D' : ''}`,
        Bun: `bun install ${packageName} ${devFlag ? '-D' : ''}`,
    }

    if (packageManager) {
        return installationCommand[packageManager.name]
    }

    if (defaultPackageManager !== 'null') {
        return installationCommand[defaultPackageManager]
    }

    if (defaultPackageManager === 'null') {
        const items: QuickPickItem[] = pm.map((item) => {
            return {
                label: item.name,
            }
        })
        const options: QuickPickOptions = {
            canPickMany: false,
            ignoreFocusOut: true,
            placeHolder: 'No package manager detected. Chose one!',
        }
        const selectedPackageManager = await window
            .showQuickPick(items, options)
            .then((name) => {
                if (name) {
                    const command = pm.find((item) => item.name === name.label)?.name
                    if (command) {
                        return installationCommand[command]
                    }
                }
            })
        return selectedPackageManager
    }
}


export const dependenciesUpdatesHandler = async (updatesStatusBar: StatusBarItem, context: ExtensionContext) => {
    let outdatedDependencies: any = await getOutdatedPackages()

    outdatedDependencies = destr(outdatedDependencies)

    outdatedDependencies = Object.keys(outdatedDependencies).map((key) => {
        return {
            current: outdatedDependencies[key].current,
            latest: outdatedDependencies[key].latest,
            wanted: outdatedDependencies[key].wanted,
            dependent: outdatedDependencies[key].dependent,
            name: key,
        }
    })

    await commands.executeCommand('nuxtr.globalState', { update: true, name: 'outdatedDependencies', value: outdatedDependencies })

    const updates = outdatedDependencies.length

    if (updates) {
        updatesStatusBar.command = 'nuxtr.updateDependencies'
        updatesStatusBar.tooltip = `Nuxt Dependencies: ${updates} outdated dependencies`
        updatesStatusBar.text = '$(nuxtr-npm) ' + updates
    } else {
        updatesStatusBar.tooltip = 'Nuxt Dependencies: Up to date'
        updatesStatusBar.text = '$(nuxtr-npm) ' + updates

    }
}

export const updateDependencies = async () => {
    const packageManager = detectPackageManagerByName()

    const defaultPackageManager = getConfiguration().defaultPackageManager

    const outdatedDependenciesList: any = await commands.executeCommand('nuxtr.globalState', { name: 'outdatedDependencies' })

    const updateCommand: any = {
        Yarn: `yarn add`,
        NPM: `npm install`,
        pnpm: `pnpm install`
    }

    const command = packageManager ? updateCommand[packageManager.name] : updateCommand[defaultPackageManager] !== null ? updateCommand[defaultPackageManager] : updateCommand['NPM']

    const items: QuickPickItem[] = outdatedDependenciesList.map((item: any) => {
        return {
            label: item.name,
            description: `${item.current} -> ${item.latest}`,
        }
    })

    const options: QuickPickOptions = {
        canPickMany: true,
        ignoreFocusOut: true,
        placeHolder: 'Select packages to update',
    }

    const selectedPackages: any = await window.showQuickPick(items, options)

    if (selectedPackages && selectedPackages.length > 0) {
        const packagesToUpdate = selectedPackages.map((item: any) => {
            return item.label + '@' + outdatedDependenciesList.find((dependency: any) => dependency.name === item.label).latest
        })

        if (command === undefined) {
            const response = await window.showErrorMessage(
                'No lockfiles found. Install dependencies first?',
                'Install',
                'Close'
            )
            if (response === 'Install') {
                installDependencies()
            }
        } else {
            await runCommand({
                command: `${command} ${packagesToUpdate.join(' ')}`,
                message: `Updating ${packagesToUpdate.length > 1 ? packagesToUpdate.join(' | ') : packagesToUpdate.join(' ')}`,
                successMessage: `${packagesToUpdate.length > 1 ? packagesToUpdate.join(' | ') : packagesToUpdate.join(' ')} installed`,
                errorMessage: `Error installing ${packagesToUpdate.length} packages`,
                logger: true
            })
        }

    }

    return
}

export async function upgradePackage(packageName: string): Promise<void> {
    const packageManager = detectPackageManagerByName()
    const defaultPackageManager = getConfiguration().defaultPackageManager
    const options: QuickPickOptions = {
        canPickMany: false,
        ignoreFocusOut: true,
        placeHolder: 'No package manager detected. Chose one!',
    }

    if (!packageManager) {
        if (!defaultPackageManager) {
            window.showQuickPick(items, options).then((name) => {
                if (name) {
                    const command = pm.find((item) => item.name === name.label)?.installCommand
                    if (command) {
                        exec(command, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => { })
                    }
                }
            })
        } else {
            const command = pm.find((item) => item.name === defaultPackageManager)?.installCommand
            if (command) {
                exec(command, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => { })
            }
        }
    } else {
        const command = `${packageManager.installCommand} ${packageName} --save-dev`
        exec(command, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => { })
    }
}

export async function managePackageVersion(packageName: string) {
    const packageManager = detectPackageManagerByName()
    const defaultPackageManager = getConfiguration().defaultPackageManager

    const options: QuickPickOptions = {
        canPickMany: false,
        ignoreFocusOut: true,
        placeHolder: 'No package manager detected. Chose one!',
    }

    if (!packageManager) {
        if (!defaultPackageManager) {
            window.showQuickPick(items, options).then((name) => {
                if (name) {
                    const command = pm.find((item) => item.name === name.label)?.installCommand
                    if (command) {
                        exec(command, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => { })
                    }
                }
            })
        } else {
            const command = pm.find((item) => item.name === defaultPackageManager)?.installCommand
            if (command) {
                exec(command, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => { })
            }
        }
    } else {
        let checkingVersionCommand = `npm view ${packageName} versions --json`

        // show progress bar while checking version
        await window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: `Finding ${packageName} versions...`,
                cancellable: false,
            },
            async () => {
                return new Promise((resolve, reject) => {
                    const child = exec(checkingVersionCommand, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            reject(error.message)
                        } else if (stderr) {
                            reject(stderr)
                        } else {
                            resolve(stdout)
                            let versions: any = []
                            let versionOfPackage = getProjectDependencies()
                            JSON.parse(stdout)
                                .reverse()
                                .forEach((version: any) => {
                                    versions.push({
                                        label: version,
                                        description: versionOfPackage?.find((item: any) => item.name === packageName)?.version.replace('^', '') === version ? 'current version' : '',
                                    })
                                })

                            const options: QuickPickOptions = {
                                canPickMany: false,
                                ignoreFocusOut: true,
                                placeHolder: `Select which ${packageName} version to install`,
                            }
                            window.showQuickPick(versions, options).then((version: any) => {
                                if (version) {
                                    const installationCommand = `${packageManager.installCommand} ${packageName}@${version.label} --save-dev`
                                    //  show progress bar while installing package
                                    window.withProgress(
                                        {
                                            location: ProgressLocation.Notification,
                                            title: `Installing ${packageName}@${version.label}...`,
                                            cancellable: false,
                                        },
                                        async () => {
                                            return new Promise((resolve, reject) => {
                                                const child = exec(installationCommand, { cwd: projectRootDirectory() }, (error: any, stdout: any, stderr: any) => {
                                                    if (error) {
                                                        reject(error.message)
                                                    } else if (stderr) {
                                                        reject(stderr)
                                                    } else {
                                                        resolve(stdout)
                                                    }
                                                })

                                                child.on('exit', async (code) => {
                                                    if (code === 0) {
                                                        window.showInformationMessage(`Successfully installed ${packageName}@${version.label}`)
                                                    } else {
                                                        const response = await window.showErrorMessage(
                                                            `Failed to upgrade ${packageName}@${version.label}. Do you want to install manually?`,
                                                            'Install Manually'
                                                        )

                                                        if (response === 'Install Manually') {
                                                            newTerminal(
                                                                `Nuxtr: Install ${packageName}`,
                                                                `${packageManager?.installCommand} ${packageName}@${version.label}`
                                                            )
                                                        }
                                                    }
                                                })
                                            })
                                        }
                                    )
                                }
                            })
                        }
                    })


                })
            }
        )

    }
}

export async function removePackage(packageName: string): Promise<void> {
    const packageManager = detectPackageManagerByName()
    // uninstall package

    await window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: `Uninstalling ${packageName}...`,
            cancellable: false,
        },
        async () => {
            return new Promise((resolve, reject) => {
                const command = `${packageManager?.uninstallCommand} ${packageName}`
                const child = exec(
                    command,
                    { cwd: projectRootDirectory() },
                    (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            reject(error.message)
                        } else if (stderr) {
                            reject(stderr)
                        } else {
                            resolve(stdout)
                        }
                    }
                )

                child.on('exit', async (code) => {
                    if (code === 0) {
                        window.showInformationMessage(`Successfully uninstalled ${packageName}`)
                    } else {
                        const response = await window.showErrorMessage(
                            `Failed to uninstall ${packageName}. Please try again or uninstall it manually.`,
                            'Uninstall Manually'
                        )

                        if (response === 'Uninstall Manually') {
                            newTerminal(
                                `Nuxtr: Install ${packageName}`,
                                `${packageManager?.uninstallCommand} ${packageName}`
                            )
                        }
                    }
                })
            })
        }
    )
}