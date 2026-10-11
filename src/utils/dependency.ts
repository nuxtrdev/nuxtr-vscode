/** Inspect project dependencies and run package actions through shared detection and complete process results. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import semver from 'semver';
import { applyCatalogUpdate, prepareCatalogUpdate, resolveDependency } from '../core/catalogs';
import { StatusBarItem, commands, window } from 'vscode';
import { ManagerName, detectManager, managerCommand, managers } from '../core/managers';
import { executeCommand, requireSuccess } from '../core/process';
import { currentProject } from '../services/project';
import { nuxtrConfiguration, projectRootDirectory, runCommand } from './global';

export interface Dependency { name: string; version: string; specifier: string; dev: boolean; }
export interface OutdatedDependency { name: string; current?: string; latest: string; wanted?: string; }

/** Read declared dependency groups without losing the original specifier or development/runtime classification. */
export function getProjectDependencies (): Promise<Dependency[]> {
    const path = join(projectRootDirectory(), 'package.json');
    if (!existsSync(path)) { return Promise.resolve([]); }
    const manifest = JSON.parse(readFileSync(path, 'utf8'));
    const result: Dependency[] = [];
    for (const [dev, values] of [[false, manifest.dependencies], [true, manifest.devDependencies]] as const) {
        for (const [name, specifier] of Object.entries(values || {}) as [string, string][]) {
            result.push({ name, version: resolveDependency(projectRootDirectory(), name, specifier).version || specifier, specifier, dev });
        }
    }
    return Promise.resolve(result);
}

/** Resolve the nearest project/workspace package manager and the configured fallback consistently. */
export function detectPackageManagerByName () {
    const fallback = nuxtrConfiguration().defaultPackageManager;
    const name = detectManager(projectRootDirectory(), fallback === 'null' ? undefined : fallback);
    if (!name) { return; }
    const executable = { NPM: 'npm', Yarn: 'yarn', Bun: 'bun', pnpm: 'pnpm' }[name];
    return { name, installCommand: executable + (name === 'NPM' ? ' install' : ' add'), uninstallCommand: executable + (name === 'NPM' ? ' uninstall' : ' remove'), runCommand: executable + ' run', lockFile: { Bun: 'bun.lock', pnpm: 'pnpm-lock.yaml', Yarn: 'yarn.lock', NPM: 'package-lock.json' }[name] };
}

/** Ask for a manager only when neither workspace metadata nor the explicit fallback resolves it. */
export async function choosePackageManager (): Promise<ManagerName | undefined> {
    const detected = detectPackageManagerByName();
    if (detected) { return detected.name; }
    const selection = await window.showQuickPick(managers, { placeHolder: 'Select this project’s package manager' });
    return managers.find(manager => manager === selection);
}

/** Produce a legacy command string for scaffold callers; shared execution turns these tokens into argument arrays. */
export async function getInstallationCommand (packageName: string, devFlag: boolean): Promise<string> {
    const manager = await choosePackageManager();
    if (!manager) { throw new Error('Package installation cancelled.'); }
    const command = managerCommand(manager, 'add', projectRootDirectory(), packageName.trim().split(/\s+/), devFlag);
    return [command.executable, ...command.args].join(' ');
}

/** Collect and normalize npm/pnpm outdated JSON, including empty output and pnpm's array format. */
export async function getOutdatedPackages (): Promise<string> {
    const manager = detectPackageManagerByName()?.name || 'NPM';
    const result = requireSuccess(await executeCommand(managerCommand(manager, 'outdated', projectRootDirectory())));
    const output = result.stdout.trim();
    if (!output) {
        if (result.exitCode !== 0) { throw new Error(result.stderr || 'Outdated command failed without JSON output.'); }
        return '{}';
    }
    const parsed = JSON.parse(output);
    const values = Array.isArray(parsed) ? Object.fromEntries(parsed.map(item => [item.packageName || item.name, item])) : parsed;
    if (!values || typeof values !== 'object' || values.error) { throw new Error('The package manager returned invalid outdated data.'); }
    return JSON.stringify(values);
}

/** Read script definitions from the selected project, returning an empty map for a missing manifest. */
export function getProjectScripts (): Record<string, string> {
    const path = join(projectRootDirectory(), 'package.json');
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).scripts || {} : {};
}

/** Store update data and always settle the status indicator, including command/parse failures. */
export async function dependenciesUpdatesHandler (status: StatusBarItem) {
    try {
        const values = JSON.parse(await getOutdatedPackages());
        const updates: OutdatedDependency[] = Object.entries(values).map(([name, data]) => ({ name, ...(data as object) } as OutdatedDependency));
        await commands.executeCommand('nuxtr.globalState', { update: true, name: 'outdatedDependencies', value: updates });
        status.text = '$(nuxtr-npm) ' + updates.length;
        status.tooltip = updates.length > 0 ? `${updates.length} dependency updates available` : 'Dependencies are up to date';
        status.command = updates.length > 0 ? 'nuxtr.updateDependencies' : undefined;
    } catch (error) {
        status.text = '$(warning)'; status.tooltip = String(error); status.command = undefined;
    }
}

/** Install a requested version while preserving an existing dependency's development/runtime group. */
export async function installPackageVersion (name: string, version: string) {
    if (!semver.valid(version) && version !== 'latest') { throw new Error('Select a valid package version.'); }
    const manager = await choosePackageManager();
    if (!manager) { return; }
    const existing = (await getProjectDependencies()).find(dependency => dependency.name === name);
    if (existing?.specifier.startsWith('catalog:')) {
        let target = version;
        if (target === 'latest') {
            const result = requireSuccess(await executeCommand({ executable: 'npm', args: ['view', name, 'version', '--json'], cwd: projectRootDirectory() }));
            target = JSON.parse(result.stdout);
        }
        const update = prepareCatalogUpdate(projectRootDirectory(), name, existing.specifier, target);
        const choice = await window.showInformationMessage(`Updating ${existing.specifier || 'catalog:default'} affects every workspace package referencing ${name}.`, 'Update catalog');
        if (choice !== 'Update catalog') { return; }
        await applyCatalogUpdate(update, () => runCommand({ command: managerCommand('pnpm', 'install', currentProject().packageManagerRoot), message: `Updating ${name} catalog`, successMessage: `${name} catalog updated`, errorMessage: 'Catalog installation failed; the catalog edit will be restored', logger: true }));
        return;
    }
    await runCommand({ command: managerCommand(manager, 'add', projectRootDirectory(), [`${name}@${version}`], existing?.dev ?? true), message: `Installing ${name}@${version}`, successMessage: `${name} installed`, errorMessage: `Failed to install ${name}`, logger: true });
}

/** Prompt for dependency updates and install each package with its original dependency group. */
export async function updateDependencies () {
    const values = JSON.parse(await getOutdatedPackages());
    const updates: OutdatedDependency[] = Object.entries(values).map(([name, value]) => ({ name, ...(value as object) } as OutdatedDependency));
    const selection = await window.showQuickPick(updates.map(update => ({ label: update.name, description: `${update.current || 'unknown'} → ${update.latest}`, update })), { canPickMany: true, placeHolder: 'Select packages to update' });
    for (const item of selection || []) { await installPackageVersion(item.update.name, item.update.latest); }
}

/** Upgrade one package to the registry's current stable release, awaiting success before returning. */
export async function upgradePackage (name: string) { await installPackageVersion(name, 'latest'); }

/** Fetch published versions with complete output, then install the selected version without changing its dependency group. */
export async function managePackageVersion (name: string) {
    const result = requireSuccess(await executeCommand({ executable: 'npm', args: ['view', name, 'versions', '--json'], cwd: projectRootDirectory() }));
    const parsed = JSON.parse(result.stdout);
    const versions = (Array.isArray(parsed) ? parsed : [parsed]).filter(version => semver.valid(version)).reverse();
    const selection = await window.showQuickPick(versions, { placeHolder: `Select a ${name} version` });
    if (selection) { await installPackageVersion(name, selection); }
}

/** Remove a dependency with the same manager selection and awaited progress used for installation. */
export async function removePackage (name: string): Promise<void> {
    const manager = await choosePackageManager();
    if (manager) { await runCommand({ command: managerCommand(manager, 'remove', projectRootDirectory(), [name]), message: `Removing ${name}`, successMessage: `${name} removed`, errorMessage: `Failed to remove ${name}`, logger: true }); }
}

/** Check whether the package appears in either declared dependency group. */
export async function isDependencyInstalled (name: string): Promise<boolean> { return (await getProjectDependencies()).some(dependency => dependency.name === name); }
