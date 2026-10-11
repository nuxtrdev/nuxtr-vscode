/** Offline catalogue regressions cover valid refresh caching, failure recovery and real Nuxt compatibility ranges. */
import { expect, it, vi } from 'vitest';
import { catalogueState, moduleCompatible, normalizeCatalogue, refreshCatalogue } from '../../src/core/catalogue';
const modules = [{ name: 'eslint', npm: '@nuxt/eslint', compatibility: { nuxt: '>=3.0.0' }, github: 'https://github.com/nuxt/eslint' }];
it('normalizes official metadata and uses semver for Nuxt 3/4 instead of substring matches', () => {
    const module = normalizeCatalogue(modules)[0];
    expect(moduleCompatible(module, '4.6.1')).toBe(true);
    expect(moduleCompatible(module, '3.21.11')).toBe(true);
    expect(moduleCompatible(module, '2.18.1')).toBe(false);
    expect(moduleCompatible(module, 'catalog:')).toBe(false);
    expect(() => normalizeCatalogue([])).toThrow();
});
it('retains expired cache and uses the snapshot when the cache is malformed', () => {
    const snapshot = { updatedAt: 1, modules: normalizeCatalogue(modules) };
    expect(catalogueState({ updatedAt: 1, modules }, snapshot, 100_000_000).source).toBe('cache');
    expect(catalogueState({ updatedAt: 1, modules }, snapshot, 100_000_000).stale).toBe(true);
    expect(catalogueState({ modules: [] }, snapshot).source).toBe('snapshot');
});
it('saves successful refreshes and never replaces good data with network or validation failures', async () => {
    const previous = catalogueState(undefined, { updatedAt: 1, modules: normalizeCatalogue(modules) });
    const save = vi.fn(() => Promise.resolve());
    expect((await refreshCatalogue(previous, () => Promise.resolve(modules), save)).source).toBe('network');
    expect(save).toHaveBeenCalledOnce();
    const failed = await refreshCatalogue(previous, () => Promise.reject(new Error('Offline')), save);
    expect(failed.modules).toEqual(previous.modules);
    expect(failed.error).toContain('Offline');
    await refreshCatalogue(previous, () => Promise.resolve([]), save);
    expect(save).toHaveBeenCalledOnce();
});
