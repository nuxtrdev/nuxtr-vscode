/** Verify npm repository parsing and release-link fallbacks without live network requests. */
import { expect, it } from 'vitest';
import { releaseNotesUrl, repositorySlug } from '../../src/core/releases';
it('normalizes npm git metadata and rejects credentials, foreign hosts and subpaths', () => {
    expect(repositorySlug({ repository: { url: 'git+https://github.com/nuxt/nuxt.git' } })).toBe('nuxt/nuxt');
    expect(repositorySlug({ repository: 'github:nuxt/nuxt' })).toBe('nuxt/nuxt');
    for (const url of ['javascript:alert(1)', 'https://github.com.evil.test/nuxt/nuxt', 'https://token@github.com/nuxt/nuxt', 'https://github.com/nuxt/nuxt/tree/main']) { expect(repositorySlug({ repository: url })).toBeUndefined(); }
});
it('opens verified release pages and falls back for missing, unverified and offline metadata', async () => {
    const metadata = () => Promise.resolve({ repository: 'https://github.com/nuxt/nuxt' });
    expect(await releaseNotesUrl('nuxt', metadata, () => Promise.resolve(true))).toBe('https://github.com/nuxt/nuxt/releases');
    expect(await releaseNotesUrl('nuxt', metadata, () => Promise.resolve(false))).toBe('https://www.npmjs.com/package/nuxt');
    expect(await releaseNotesUrl('@nuxt/eslint', () => Promise.reject(new Error('Offline')), () => Promise.resolve(true))).toBe('https://www.npmjs.com/package/@nuxt/eslint');
});
