/** Refresh the documented official Nuxt modules CDN through the host, retaining successful cache and offline snapshot. */
import { ofetch } from 'ofetch';
import type { Memento } from 'vscode';
import snapshot from '../content/modules.json';
import { CataloguePayload, catalogueState, normalizeCatalogue, refreshCatalogue } from '../core/catalogue';
const key = 'nuxtr.moduleCatalogue.v1';

/** Load shared public module metadata without making activation depend on a network service. */
export function cachedCatalogue (storage: Memento): CataloguePayload {
    return catalogueState(storage.get(key), { modules: normalizeCatalogue(snapshot), updatedAt: Date.parse(snapshot.updatedAt) });
}

/** Refresh only on request, using a bounded request and persisting valid responses before replacing offline state. */
export function fetchCatalogue (storage: Memento, previous: CataloguePayload): Promise<CataloguePayload> {
    return refreshCatalogue(previous,
        () => ofetch('https://cdn.jsdelivr.net/npm/@nuxt/modules@latest/modules.json', { timeout: 10_000, retry: 0 }),
        value => Promise.resolve(storage.update(key, value)));
}
