/** Normalize official module data, evaluate semver compatibility and preserve usable offline catalogue state. */
import semver from 'semver';
import type { ModuleMetadata } from './modules';
import { canonicalPackageName } from './packages';
import { safeExternalUrl } from './messages';

export interface CatalogueModule extends ModuleMetadata {
    name: string; description: string; repo: string; icon: string; github: string; category: string; type: string;
    compatibility: { nuxt: string; requires: Record<string, unknown> };
    stats: { downloads?: number; stars?: number }; isLayer: boolean;
}
export interface CatalogueSnapshot { updatedAt: number; modules: CatalogueModule[]; }
export interface CataloguePayload extends CatalogueSnapshot { source: 'snapshot' | 'cache' | 'network'; stale: boolean; error?: string; projectVersion?: string; }
const layers = new Set(['seo-kit', 'umami']);

/** Accept the official array and legacy wrapper, rejecting empty/malformed responses before caching. */
export function normalizeCatalogue (input: unknown): CatalogueModule[] {
    const values = Array.isArray(input) ? input : (input as any)?.modules;
    if (!Array.isArray(values) || values.length === 0 || values.length > 5000) { throw new Error('Invalid module catalogue response.'); }
    const modules: CatalogueModule[] = [];
    for (const value of values) {
        if (!value || typeof value.name !== 'string' || typeof value.npm !== 'string') { continue; }
        try { canonicalPackageName(value.npm); } catch { continue; }
        const range = typeof value.compatibility?.nuxt === 'string' ? value.compatibility.nuxt : '';
        modules.push({ npm: value.npm, name: value.name, description: typeof value.description === 'string' ? value.description : '',
            repo: typeof value.repo === 'string' ? value.repo : '', icon: typeof value.icon === 'string' && /^[\w.-]+$/.test(value.icon) ? value.icon : '',
            github: safeExternalUrl(value.github) ? value.github : 'https://www.npmjs.com/package/' + value.npm,
            website: safeExternalUrl(value.website) ? value.website : undefined,
            category: typeof value.category === 'string' ? value.category : 'Other', type: typeof value.type === 'string' ? value.type : '3rd-party',
            compatibility: { nuxt: semver.validRange(range) ? range : '', requires: value.compatibility?.requires || {} },
            stats: { downloads: typeof value.stats?.downloads === 'number' ? value.stats.downloads : undefined, stars: typeof value.stats?.stars === 'number' ? value.stats.stars : undefined },
            isLayer: value.isLayer === true || layers.has(value.name), runtime: value.runtime === true,
            dependencyType: typeof value.dependencyType === 'string' ? value.dependencyType : undefined,
            'dependency-type': typeof value['dependency-type'] === 'string' ? value['dependency-type'] : undefined });
    }
    if (modules.length === 0) { throw new Error('Catalogue contains no valid module packages.'); }
    return modules;
}

/** Use real semver ranges, including Nuxt 4 and prerelease installed versions, without guessing unknown versions. */
export function moduleCompatible (module: CatalogueModule, version?: string): boolean {
    return Boolean(version && semver.valid(version) && module.compatibility.nuxt && semver.satisfies(version, module.compatibility.nuxt, { includePrerelease: true }));
}

/** Choose valid cache data, otherwise the bundled snapshot, and report age without discarding offline entries. */
export function catalogueState (cached: unknown, snapshot: CatalogueSnapshot, now = Date.now()): CataloguePayload {
    try {
        const value = cached as CatalogueSnapshot;
        if (!Number.isFinite(value?.updatedAt) || value.updatedAt <= 0) { throw new Error('Missing cache timestamp'); }
        return { updatedAt: value.updatedAt, modules: normalizeCatalogue(value.modules), source: 'cache', stale: now - value.updatedAt > 24 * 60 * 60 * 1000 };
    } catch { return { ...snapshot, source: 'snapshot', stale: true }; }
}

/** Cache only valid successful responses; failed refreshes retain the previous offline data and settle the request. */
export async function refreshCatalogue (previous: CataloguePayload, load: () => Promise<unknown>, save: (snapshot: CatalogueSnapshot) => Promise<unknown>): Promise<CataloguePayload> {
    try {
        const snapshot = { modules: normalizeCatalogue(await load()), updatedAt: Date.now() };
        await save(snapshot);
        return { ...snapshot, source: 'network', stale: false };
    } catch (error) { return { ...previous, error: `Refresh failed: ${String(error)}` }; }
}
