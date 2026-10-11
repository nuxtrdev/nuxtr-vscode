/** Inspect and edit Nuxt project configuration without evaluating application code during activation. */
import { ModuleMetadata, canonicalPackageName, configModule, editModuleConfig, hasConfiguredModule } from '../core/modules';
import { currentProject } from '../services/project';
import { join, relative } from 'node:path';
import semver from 'semver';
import { resolveDependency } from '../core/catalogs';
import { DirectoryKind, readStaticConfig, resolveDirectories } from '../core/directories';
import { configAt, containsPath } from '../core/project';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { window, workspace } from 'vscode';
import { projectRootDirectory } from '.';

/** Find a supported config file in the active project, returning undefined in empty windows. */
export const findNuxtConfig = (): string | undefined => {
    if (!workspace.workspaceFolders?.length) { return; }
    try { return configAt(projectRootDirectory()); } catch { return; }
};

/** Detect a project/workspace-installed layer from its own Nuxt configuration. */
const isLayer = (value: string | ModuleMetadata): boolean => {
    const name = canonicalPackageName(value);
    return [projectRootDirectory(), currentProject().packageManagerRoot].some(root => Boolean(configAt(join(root, 'node_modules', name))));
};

/** Read the current configuration path and source, reporting a missing file before an attempted edit. */
function currentConfig () {
    const path = findNuxtConfig();
    if (!path) { throw new Error('No Nuxt configuration found. Select a project first.'); }
    return { path, source: readFileSync(path, 'utf8') };
}

/** Check whether a canonical module or tuple is configured without modifying the config. */
export const isModuleConfigured = (value: string | ModuleMetadata) => {
    const { source } = currentConfig();
    return hasConfiguredModule(source, value, isLayer(value));
};

/** Remove a package’s config entry after successful uninstallation, propagating edit failure to the caller. */
export const removeNuxtModule = (value: string | ModuleMetadata) => {
    const { path, source } = currentConfig();
    writeFileSync(path, editModuleConfig(source, value, 'remove', isLayer(value)), 'utf8');
};

/** Check whether the current workspace root contains a Nuxt configuration. */
export const isNuxtProject = () => {
    if (!workspace.workspaceFolders?.length) { return false; }
    return Boolean(findNuxtConfig());
};

/** Read the declared Nuxt version from the active package manifest. */
export const getNuxtVersion = (): string | undefined => {
    if (!workspace.workspaceFolders?.length) { return; }
    const packageJsonPath = `${projectRootDirectory()}/package.json`;
    if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };
        if ('nuxt' in dependencies) {
            const nuxtVersion = dependencies.nuxt;
            return resolveDependency(projectRootDirectory(), 'nuxt', nuxtVersion).version;
        }
    } else {
        return;
    }
};

/** Read a literal application source-directory override. */
export const hasSrcDir = (): string => {
    return '/' + relative(projectRootDirectory(), projectDirectories().app);
};


/** Read a literal server-directory override. */
export const hasServerDir = (): string => {
    return relative(projectDirectories().app, projectDirectories().server);
};

/** Determine whether the declared project version is Nuxt 2. */
export const isNuxtTwo = (): boolean | undefined => {
    const nuxtVersion = getNuxtVersion();
    if (typeof nuxtVersion === 'string') {
        return nuxtVersion.startsWith('2') ? true : false;
    }
};


/** Apply a supported static config edit and propagate failure so installation and edit outcomes remain distinguishable. */
export const updateNuxtConfig = (action: 'inject-eslint-devChcker' | 'add-module', input?: string | ModuleMetadata) => {
    const { path, source } = currentConfig();
    if (action === 'add-module') {
        if (!input) { throw new Error('A module package name is required.'); }
        writeFileSync(path, editModuleConfig(source, input, 'add', isLayer(input)), 'utf8');
    } else {
        const { module, config } = configModule(source);
        config.eslint ||= {};
        config.eslint.checker = true;
        writeFileSync(path, module.generate().code.trimEnd() + '\n', 'utf8');
    }
};

/** Resolve separate application and root-level directories from the current project's static config. */
export function projectDirectories () {
    const config = findNuxtConfig();
    if (!config) { throw new Error('No Nuxt config found. Select a Nuxt project before creating files.'); }
    const declared = getNuxtVersion();
    const version = declared && semver.validRange(declared) ? semver.minVersion(declared) : undefined;
    if (!version) { throw new Error('Cannot determine the Nuxt version. Install project dependencies or use an Explorer folder to create files.'); }
    return resolveDirectories(projectRootDirectory(), readStaticConfig(config), version.major);
}

/** Resolve a logical Nuxt directory to its absolute filesystem location. */
export function projectDirectory (kind: DirectoryKind): string { return projectDirectories()[kind]; }

/** Classify an Explorer scaffold safely, asking for an explicit runtime when directory configuration is computed/inherited. */
export async function directServerScaffold (path: string): Promise<boolean | undefined> {
    try { return containsPath(projectDirectory('server'), path); }
    catch {
        const runtime = await window.showQuickPick(['Nuxt application', 'Nitro server'], { placeHolder: 'Cannot resolve inherited/computed directories. Choose the runtime for this Explorer file.' });
        return runtime ? runtime === 'Nitro server' : undefined;
    }
}
