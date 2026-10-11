/** Validate canonical package names for process arguments, registry lookups and catalogue metadata. */
import type { ModuleMetadata } from './modules';

/** Accept a canonical package name or catalogue item and reject values that are not package names. */
export function canonicalPackageName (value: string | ModuleMetadata): string {
    const name = typeof value === 'string' ? value : value.npm;
    if (typeof name !== 'string' || name.length > 214 || name.split('/').some(part => part === '.' || part === '..') || name.startsWith('-') || !/^(?:@[a-z\d._~-]+\/)?[a-z\d._~-]+$/i.test(name)) { throw new Error('A canonical npm package name is required.'); }
    return name;
}
