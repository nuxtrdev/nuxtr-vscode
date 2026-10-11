/** Derive release-note links from public registry metadata and verified repository identities. */
import { canonicalPackageName } from './modules';

/** Normalize npm's repository forms to an exact GitHub owner/repository pair. */
export function repositorySlug (metadata: unknown): string | undefined {
    if (!metadata || typeof metadata !== 'object') { return; }
    const repository = (metadata as Record<string, any>).repository;
    let value = typeof repository === 'string' ? repository : repository?.url;
    if (typeof value !== 'string') { return; }
    value = value.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/^git@github\.com:/, 'https://github.com/');
    if (value.startsWith('github:')) { value = 'https://github.com/' + value.slice(7); }
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port || url.search || url.hash) { return; }
        const slug = url.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\.git$/, '');
        return /^[\w.-]+\/[\w.-]+$/.test(slug) && !slug.split('/').includes('..') ? slug : undefined;
    } catch { return; }
}

/** Verify a metadata-derived repository before opening its release page; fall back on any metadata/network failure. */
export async function releaseNotesUrl (name: string, metadata: (name: string) => Promise<unknown>, verify: (slug: string) => Promise<boolean>): Promise<string> {
    const canonical = canonicalPackageName(name);
    const fallback = 'https://www.npmjs.com/package/' + canonical;
    try {
        const slug = repositorySlug(await metadata(canonical));
        if (slug && await verify(slug)) { return 'https://github.com/' + slug + '/releases'; }
    } catch { /* Offline packages and repository API limits retain the npm page fallback. */ }
    return fallback;
}
