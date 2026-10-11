/** Read and edit the current project’s DevTools configuration lazily, preserving source comments. */
import { parseModule } from 'magicast';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'pathe';
import semver from 'semver';
import { trimEnd } from 'string-ts';
import { ThemeColor, window } from 'vscode';
import { hideDevtoolsStatusBar, updateDevtoolsStatusBar } from '../statusBar';
import {
    findNuxtConfig,
    getInstallationCommand,
    getNuxtVersion,
    isNuxtTwo,
    projectRootDirectory,
    runCommand,
} from '../utils';

let mod: any;
let nuxtConfigFile: string;
const moduleName = '@nuxt/devtools';
let nuxtConfigPath: string | undefined;

/** Reload the active project config before every read or edit; report missing configuration to the caller. */
const updateNuxtFile = () => {
    nuxtConfigPath = findNuxtConfig();
    if (!nuxtConfigPath) { throw new Error('No Nuxt configuration found for this project.'); }
    nuxtConfigFile = readFileSync(`${nuxtConfigPath}`, 'utf8');
    mod = parseModule(nuxtConfigFile, { sourceFileName: nuxtConfigPath });
};

/** Resolve the literal configuration object used by defineNuxtConfig. */
function readConfigFile () {
    updateNuxtFile();
    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    return config;
}

/** Toggle DevTools in the active configuration and preserve existing comments. */
async function directToggleDevTools () {
    try {
        const config = await readConfigFile();
        let isEnabled: boolean;

        if (!config.devtools && !config.$development?.devtools) {
            config.devtools = { enabled: false };
            window.showInformationMessage(
                `Nuxt Devtools ${config.devtools.enabled ? 'disabled' : 'enabled'}.`
            );
        }

        if (config.devtools) {
            isEnabled = config.devtools.enabled;

            config.devtools.enabled = !isEnabled;

            window.showInformationMessage(
                `Nuxt Devtools ${isEnabled ? 'disabled' : 'enabled'}.`
            );
        } else if (config.$development?.devtools) {
            isEnabled = config.$development.devtools.enabled;

            config.$development.devtools.enabled = !isEnabled;

            window.showInformationMessage(
                `Nuxt Devtools ${isEnabled ? 'disabled' : 'enabled'}.`
            );
        }

        const generated = mod.generate().code;
        writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf8');
        return;
    } catch (error) {
        window.showErrorMessage(`Error toggling Nuxt Devtools: ${error}`);
    }
}

/** Check the current manifest without the stale cache used by require. */
function isDevtoolsInstalled (): boolean {
    const packageJsonPath = join(`${projectRootDirectory()}/package.json`);
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    return (
        (packageJson.dependencies &&
            packageJson.dependencies['@nuxt/devtools'] !== undefined) ||
        (packageJson.devDependencies &&
            packageJson.devDependencies['@nuxt/devtools'] !== undefined)
    );
}

/** Offer installation of DevTools for older supported Nuxt versions. */
async function installDevtools () {
    const response = await window.showErrorMessage(
        'Nuxt Devtools is not installed. Install it?',
        'Install',
        'Close'
    );
    if (response === 'Install') {
        const command = await getInstallationCommand(moduleName, true);

        await runCommand({
            command,
            message: 'Installing Nuxt Devtools',
            successMessage: 'Nuxt Devtools installed successfully',
            errorMessage: 'Nuxt Devtools installation failed',
        }).then(() => {
            const generated = mod.generate().code;
            writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf8');
        });
    }
}

/** Refresh the DevTools status icon after configuration changes. */
async function nuxtConfigWatcher () {
    const config = await readConfigFile();
    let devtoolsEnabled = false;

    if (config.$development) {
        if (
            config.$development.devtools &&
            typeof config.$development.devtools === 'object'
        ) {
            devtoolsEnabled = config.$development.devtools.enabled;
        }
    } else if (config.devtools) {
        devtoolsEnabled = config.devtools.enabled;
    } else {
        devtoolsEnabled = false;
    }

    const statusText = devtoolsEnabled ? '$(nuxt-logo)' : '$(nuxt-disabled)';
    const tooltip = devtoolsEnabled
        ? 'Nuxt Devtools: Installed & Enabled'
        : 'Nuxt Devtools: Installed & Disabled';
    const color = devtoolsEnabled
        ? '#00DC82'
        : new ThemeColor('activityBar.inactiveForeground');

    updateDevtoolsStatusBar({
        command: 'nuxtr.directToggleDevTools',
        tooltip,
        text: statusText,
        color,
    });
}

/** Show DevTools availability and its current enabled state for this project. */
async function nuxtDevToolsHandler () {
    const isInstalled = isDevtoolsInstalled();
    const nuxtTwo = isNuxtTwo();
    let isDevtoolsNative = false;

    const nuxtVersion = getNuxtVersion();
    if (typeof nuxtVersion === 'string') {
        const minimum = semver.valid(nuxtVersion) || semver.minVersion(nuxtVersion)?.version;
        isDevtoolsNative = minimum ? semver.gte(minimum, '3.8.0') : false;
    }

    if (nuxtTwo) {
        updateDevtoolsStatusBar({
            command: '',
            tooltip: 'Nuxt Devtools: Not supported for Nuxt 2',
            text: '$(nuxt-disabled)',
            color: new ThemeColor('activityBar.inactiveForeground'),
        });
        hideDevtoolsStatusBar()
    } else if (!isInstalled && !isDevtoolsNative) {
        await installDevtools();
        updateDevtoolsStatusBar({
            command: 'nuxtr.directUpgradeNuxt',
            tooltip: 'Nuxt Devtools: Not installed',
            text: '$(nuxt-disabled)',
            color: '#FE0601',
        });
    } else {
        const config = await readConfigFile();
        if (typeof config.devtools === 'boolean') {
            config.devtools = {
                enabled: config.devtools,
            };
        }

        if (!config.devtools || config.devtools.enabled === false) {
            updateDevtoolsStatusBar({
                command: 'nuxtr.directToggleDevTools',
                tooltip: 'Nuxt Devtools: Installed & Disabled',
                color: new ThemeColor('activityBar.inactiveForeground'),
                text: '$(nuxt-disabled)',
            });
            return;
        } else {
            updateDevtoolsStatusBar({
                command: 'nuxtr.directToggleDevTools',
                tooltip: 'Nuxt Devtools: Installed & Enabled',
                text: '$(nuxt-logo)',
                color: '#00DC82',
            });
        }
    }
}

export {
    directToggleDevTools,
    nuxtConfigWatcher,
    nuxtDevToolsHandler
};
