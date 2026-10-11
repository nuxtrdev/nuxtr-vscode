/** Snippet regressions for import statements and packaged snippet formats (#182, #183, #188). */
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isImportContext, isServerSnippetContext, parseSnippets } from '../../src/core/snippets';
it.each(['import { vue', 'import x from "vue', 'import {\n  vue', 'import type {\n Vue'])('suppresses import-context snippets: %s', prefix => { expect(isImportContext(prefix)).toBe(true); });
it('keeps ordinary lines after completed imports eligible', () => {
    expect(isImportContext('import { ref } from "vue"\n\nvue')).toBe(false);
    expect(isImportContext('<template>\nvue')).toBe(false);
});
it('offers H3 only in JavaScript/TypeScript within the resolved server directory', () => {
    expect(isServerSnippetContext('typescript', '/project/backend/api/test.ts', '/project/backend')).toBe(true);
    expect(isServerSnippetContext('javascript', '/project/backend/utils/test.js', '/project/backend')).toBe(true);
    expect(isServerSnippetContext('typescript', '/project/backend-other/test.ts', '/project/backend')).toBe(false);
    expect(isServerSnippetContext('typescript', '/project/app/test.ts', '/project/backend')).toBe(false);
    expect(isServerSnippetContext('vue', '/project/backend/test.vue', '/project/backend')).toBe(false);
});
it('covers every documented H3 v1 request, response and advanced helper', () => {
    const expected = 'assertMethod getHeader getHeaders getQuery getRequestHeader getRequestHeaders getRequestHost getRequestIP getRequestProtocol getRequestURL getRouterParam getRouterParams getValidatedQuery getValidatedRouterParams isMethod toWebRequest getRequestFingerprint getRequestWebStream readBody readFormData readMultipartFormData readRawBody readValidatedBody appendHeader appendHeaders appendResponseHeader appendResponseHeaders clearResponseHeaders defaultContentType getResponseHeader getResponseHeaders getResponseStatus getResponseStatusText isStream isWebResponse removeResponseHeader send sendIterable sendNoContent sendRedirect sendStream sendWebResponse setHeader setHeaders setResponseHeader setResponseHeaders setResponseStatus writeEarlyHints clearSession getSession sealSession unsealSession updateSession useSession deleteCookie getCookie parseCookies setCookie sanitizeStatusCode sanitizeStatusMessage useBase handleCacheHeaders fetchWithEvent getProxyRequestHeaders proxyRequest sendProxy appendCorsHeaders appendCorsPreflightHeaders handleCors isCorsOriginAllowed isPreflightRequest createEventStream'.split(' ');
    const snippets = parseSnippets(JSON.parse(readFileSync('snippets/nitro/h3.json', 'utf8')));
    expect(snippets).toHaveLength(expected.length);
    for (const name of expected) { expect(snippets.some(snippet => snippet.prefixes.includes(name))).toBe(true); }
});
it('loads all packaged snippet files and preserves tab stops and alternate prefixes', () => {
    for (const file of ['nuxt/boilerplates', 'nuxt/components', 'nuxt/composables', 'nuxt/utils', 'nitro/boilerplates', 'nitro/utils']) {
        expect(parseSnippets(JSON.parse(readFileSync(`snippets/${file}.json`, 'utf8'))).length).toBeGreaterThan(0);
    }
    expect(parseSnippets({ sample: { prefix: ['one', 'two'], body: ['$1', '$2'] } })[0]).toMatchObject({ prefixes: ['one', 'two'], body: '$1\n$2' });
});
