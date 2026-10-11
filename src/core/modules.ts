/** Normalize Nuxt module metadata and preserve source configuration while separating installation and edit outcomes. */
import { parseModule } from 'magicast';
export interface ModuleMetadata { npm: string; website?: string; 'dependency-type'?: string; dependencyType?: string; runtime?: boolean; }
export interface InstallationResult { installed: boolean; configured: boolean; error?: unknown; }

import { canonicalPackageName } from './packages';
export { canonicalPackageName } from './packages';

/** Default Nuxt build-time modules to devDependencies, retaining explicitly declared runtime requirements. */
export function moduleIsDevelopment (module: ModuleMetadata): boolean {
    return !module.runtime && !['runtime', 'prod', 'production', 'dependencies'].includes(module['dependency-type'] || module.dependencyType || 'dev');
}

/** Read a supported literal config export, rejecting computed settings that cannot be safely edited. */
export function configModule (source: string) {
    const module = parseModule(source);
    const exported = module.exports.default;
    const config = exported?.$type === 'function-call' ? exported.$args[0] : exported;
    if (config?.$type !== 'object') { throw new Error('Nuxt configuration is computed. Add the module manually to its modules/extends array.'); }
    return { module, config };
}

/** Compare string or tuple entries using only the canonical package name. */
function matchesModule (value: any, name: string): boolean { return value === name || Array.isArray(value) && value[0] === name; }

/** Check a supported config without mutating it or duplicating tuple-style module entries. */
export function hasConfiguredModule (source: string, value: string | ModuleMetadata, layer = false): boolean {
    const { config } = configModule(source);
    const values = config[layer ? 'extends' : 'modules'];
    for (let index = 0; index < (values?.length || 0); index++) { if (matchesModule(values[index], canonicalPackageName(value))) { return true; } }
    return false;
}

/** Add/remove a canonical module or layer while retaining comments, tuples and unrelated configuration. */
export function editModuleConfig (source: string, value: string | ModuleMetadata, action: 'add' | 'remove', layer = false): string {
    const name = canonicalPackageName(value);
    const { module, config } = configModule(source);
    const key = layer ? 'extends' : 'modules';
    if (config[key] !== undefined && !Array.isArray(config[key])) { throw new Error(`${key} is computed. Edit the module configuration manually.`); }
    config[key] ||= [];
    const values = config[key];
    const included = hasConfiguredModule(source, name, layer);
    if (action === 'add' && !included) { values.push(name); }
    else if (action === 'remove' && included) {
        for (let index = values.length - 1; index >= 0; index--) { if (matchesModule(values[index], name)) { values.splice(index, 1); } }
    } else { return source; }
    return module.generate().code.trimEnd() + '\n';
}

/** Await installation before configuration and classify failures so an installed package is never reported as missing. */
export async function installThenConfigure (install: () => Promise<unknown>, configure: () => unknown | Promise<unknown>): Promise<InstallationResult> {
    try { await install(); } catch (error) { return { installed: false, configured: false, error }; }
    try { await configure(); return { installed: true, configured: true }; }
    catch (error) { return { installed: true, configured: false, error }; }
}
