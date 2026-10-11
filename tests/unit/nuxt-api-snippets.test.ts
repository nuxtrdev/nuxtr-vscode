/** Check full official Nuxt API coverage and valid snippet defaults without live network dependencies. */
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { parseSnippets, snippetSupportsNuxt } from '../../src/core/snippets';
const expected = {
    'components': [
        'client-only',
        'dev-only',
        'nuxt-client-fallback',
        'nuxt-page',
        'nuxt-layout',
        'nuxt-link',
        'nuxt-loading-indicator',
        'nuxt-error-boundary',
        'nuxt-welcome',
        'nuxt-island',
        'nuxt-img',
        'nuxt-picture',
        'teleports',
        'nuxt-route-announcer',
        'nuxt-time',
        'nuxt-announcer'
    ],
    'composables': [
        'create-use-async-data',
        'create-use-fetch',
        'on-prehydrate',
        'use-announcer',
        'use-app-config',
        'use-async-data',
        'use-cookie',
        'use-error',
        'use-fetch',
        'use-head',
        'use-head-safe',
        'use-hydration',
        'use-layout',
        'use-lazy-async-data',
        'use-lazy-fetch',
        'use-loading-indicator',
        'use-nuxt-app',
        'use-nuxt-data',
        'use-preview-mode',
        'use-request-event',
        'use-request-fetch',
        'use-request-header',
        'use-request-headers',
        'use-request-url',
        'use-response-header',
        'use-route',
        'use-route-announcer',
        'use-router',
        'use-runtime-config',
        'use-runtime-hook',
        'use-seo-meta',
        'use-server-seo-meta',
        'use-state'
    ],
    'utils': [
        'dollarfetch',
        'abort-navigation',
        'add-route-middleware',
        'call-once',
        'clear-error',
        'clear-nuxt-data',
        'clear-nuxt-state',
        'create-error',
        'define-lazy-hydration-component',
        'define-nuxt-component',
        'define-nuxt-plugin',
        'define-nuxt-route-middleware',
        'define-page-meta',
        'define-route-rules',
        'define-use-async-data-addon',
        'define-use-fetch-addon',
        'navigate-to',
        'on-before-route-leave',
        'on-before-route-update',
        'on-nuxt-ready',
        'prefetch-components',
        'preload-components',
        'preload-route-components',
        'prerender-routes',
        'refresh-cookie',
        'refresh-nuxt-data',
        'reload-nuxt-app',
        'set-page-layout',
        'set-response-status',
        'show-error',
        'update-app-config'
    ]
} as const;
it.each(['components', 'composables', 'utils'] as const)('covers every documented Nuxt %s API', (group) => {
    const definitions = JSON.parse(readFileSync(`snippets/nuxt/${group}.json`, 'utf8'));
    const urls = Object.values(definitions).map((snippet: any) => snippet.documentation);
    for (const slug of expected[group]) { expect(urls).toContain(`https://nuxt.com/docs/4.x/api/${group}/${slug}`); }
    expect(parseSnippets(definitions).every(snippet => snippet.body.length > 0)).toBe(true);
});
it('keeps newer Nuxt APIs out of older or unresolved projects and preserves their documentation metadata', () => {
    const snippet = parseSnippets(JSON.parse(readFileSync('snippets/nuxt/composables.json', 'utf8'))).find(item => item.name === 'createUseFetch')!;
    expect(snippet.documentation).toBe('https://nuxt.com/docs/4.x/api/composables/create-use-fetch');
    expect(snippetSupportsNuxt(snippet, '^4.6.1')).toBe(true);
    expect(snippetSupportsNuxt(snippet, '^4.4.0')).toBe(true);
    for (const version of ['^3.21.11', '^4.3.0', 'catalog:', undefined]) { expect(snippetSupportsNuxt(snippet, version)).toBe(false); }
});
