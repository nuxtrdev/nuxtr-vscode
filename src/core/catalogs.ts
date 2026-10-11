/** Resolve dependency versions and pnpm catalogs while preserving references, YAML comments and failed-update rollback. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import semver from 'semver';
import { parseDocument } from 'yaml';
export interface ResolvedDependency { specifier: string; range?: string; version?: string; catalogFile?: string; error?: string; }
export interface CatalogUpdate { file: string; original: string; updated: string; }

/** Walk upward to the nearest pnpm workspace YAML rather than searching arbitrary Nuxt version text. */
export function workspaceCatalogFile (root: string): string | undefined {
    let directory = root;
    while (true) {
        const file = join(directory, 'pnpm-workspace.yaml');
        if (existsSync(file)) { return file; }
        const parent = dirname(directory);
        if (parent === directory) { return; }
        directory = parent;
    }
}

/** Translate default shorthand/named references into exact YAML paths. */
function catalogPath (name: string, reference: string): string[] {
    const catalog = reference.slice('catalog:'.length);
    return catalog === '' || catalog === 'default' ? ['catalog', name] : ['catalogs', catalog, name];
}

/** Read an installed package version without executing its code; validate the package name before resolving paths. */
function installedVersion (root: string, name: string): string | undefined {
    if (!/^(?:@[a-z\d._~-]+\/)?[a-z\d._~-]+$/i.test(name)) { return; }
    let directory = root;
    while (true) {
        try {
            const version = JSON.parse(readFileSync(join(directory, 'node_modules', name, 'package.json'), 'utf8')).version;
            if (semver.valid(version)) { return version; }
        } catch { /* The package may be installed at the workspace root instead. */ }
        const parent = dirname(directory);
        if (parent === directory) { return; }
        directory = parent;
    }
}

/** Resolve a declaration to a safe semantic version, leaving unsupported/missing references explicitly unresolved. */
export function resolveDependency (root: string, name: string, specifier: string): ResolvedDependency {
    const result: ResolvedDependency = { specifier };
    let range = specifier;
    if (specifier.startsWith('catalog:')) {
        const file = workspaceCatalogFile(root);
        result.catalogFile = file;
        if (!file) { return { ...result, error: 'No pnpm-workspace.yaml found for this catalog reference.' }; }
        const document = parseDocument(readFileSync(file, 'utf8'));
        if (document.errors.length > 0) { return { ...result, error: 'The workspace catalog YAML is invalid.' }; }
        const entry = document.getIn(catalogPath(name, specifier));
        if (typeof entry !== 'string') { return { ...result, error: `Missing ${name} in ${specifier || 'default'} catalog.` }; }
        range = entry;
    }
    result.range = range;
    if (range.startsWith('npm:')) { range = range.slice(range.lastIndexOf('@') + 1); }
    result.version = installedVersion(root, name) || (semver.validRange(range) ? semver.minVersion(range)?.version : undefined);
    if (!result.version) { result.error = `Cannot resolve ${specifier} without a valid installed package version.`; }
    return result;
}

/** Prepare an exact YAML scalar edit, retaining the original ^/~ preference and comments without rewriting manifests. */
export function prepareCatalogUpdate (root: string, name: string, reference: string, version: string): CatalogUpdate {
    if (!semver.valid(version)) { throw new Error('A catalog update requires a valid package version.'); }
    const file = workspaceCatalogFile(root);
    if (!file) { throw new Error('No workspace catalog file found.'); }
    const original = readFileSync(file, 'utf8');
    const document = parseDocument(original);
    if (document.errors.length > 0) { throw new Error('Cannot update invalid workspace YAML.'); }
    const path = catalogPath(name, reference);
    const previous = document.getIn(path);
    if (typeof previous !== 'string' || !semver.validRange(previous)) { throw new Error('The catalog entry is missing or uses a non-semver declaration. Update it manually.'); }
    document.setIn(path, (/^[~^]/.exec(previous)?.[0] || '') + version);
    const yaml = document.toString();
    return { file, original, updated: original.includes('\r\n') ? yaml.replaceAll('\n', '\r\n') : yaml };
}

/** Apply a catalog edit for installation and restore it on failure unless another editor changed the file meanwhile. */
export async function applyCatalogUpdate<T> (update: CatalogUpdate, install: () => Promise<T>): Promise<T> {
    if (readFileSync(update.file, 'utf8') !== update.original) { throw new Error('The catalog changed while preparing the update. Refresh and try again.'); }
    writeFileSync(update.file, update.updated);
    try { return await install(); }
    catch (error) {
        if (readFileSync(update.file, 'utf8') === update.updated) { writeFileSync(update.file, update.original); }
        throw error;
    }
}
