/** Fetch release-note metadata in the extension host and cache successful link resolutions. */
import { ofetch } from 'ofetch';
import { releaseNotesUrl } from '../core/releases';
import { openExternalLink } from '../utils/global';
const links = new Map<string, { url: string; expires: number }>();

/** Resolve a verified public repository release page or the package's npm page and open it. */
export async function openPackageReleaseNotes (name: string) {
    let result = links.get(name);
    if (!result || result.expires <= Date.now()) {
        const url = await releaseNotesUrl(name,
            packageName => ofetch('https://registry.npmjs.org/' + encodeURIComponent(packageName) + '/latest', { timeout: 8000, retry: 0 }),
            async slug => {
                const repository = await ofetch<{ full_name?: string }>('https://api.github.com/repos/' + slug, { timeout: 8000, retry: 0, headers: { Accept: 'application/vnd.github+json' } });
                return repository.full_name?.toLowerCase() === slug.toLowerCase();
            });
        result = { url, expires: Date.now() + 30 * 60 * 1000 };
        links.set(name, result);
    }
    return openExternalLink(result.url);
}
