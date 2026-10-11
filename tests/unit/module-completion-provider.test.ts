/** Exercise scoped completion toggles, cancellation, metadata escaping and refreshed offline cache without fetching. */
import { beforeEach, expect, test, vi } from 'vitest';
import { NuxtModulesCompletionProvider } from '../../src/intellisense/completionProviders/modules';
const host = vi.hoisted(() => ({ enabled: true, cache: undefined as any, version: '4.6.1' }));
vi.mock('vscode', () => ({
    workspace: { getConfiguration: () => ({ get: () => host.enabled }) },
    CompletionItemKind: { Module: 9 },
    CompletionItem: class CompletionItem { constructor (public label: string) {} },
    Range: class Range { constructor (public start: any, public end: any) {} },
    MarkdownString: class MarkdownString {
        value = ''; appendText (value: string) { this.value += value; return this; } appendMarkdown (value: string) { this.value += value; return this; }
    },
}));
vi.mock('../../src/services/project', () => ({ currentProject: () => ({ configPath: '/project/nuxt.config.ts' }), withProject: (_project: unknown, action: any) => action() }));
vi.mock('../../src/utils/nuxt', () => ({ getNuxtVersion: () => host.version }));
const storage = { get: () => host.cache } as any;
const provider = new NuxtModulesCompletionProvider(storage);
/** Request completion at an actual package-string cursor in a known Nuxt configuration. */
function request (file = '/project/nuxt.config.ts', canceled = false) {
    const source = 'export default defineNuxtConfig({ modules: ["@nuxt/"] })';
    const document = { uri: { fsPath: file }, getText: () => source, offsetAt: () => source.indexOf('@nuxt/') + 6, positionAt: (offset: number) => ({ offset }) } as any;
    return provider.provideCompletionItems(document, {} as any, { isCancellationRequested: canceled } as any);
}
beforeEach(() => {
    vi.restoreAllMocks(); host.enabled = true; host.version = '4.6.1';
    host.cache = { updatedAt: Date.now(), modules: [{ name: 'UI', npm: '@nuxt/ui', description: 'UI components', website: 'https://ui.nuxt.com', compatibility: { nuxt: '^3 || ^4' } }] };
});
test('shares refreshed cache immediately and never fetches during completion', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    expect(request().map(item => item.label)).toEqual(['@nuxt/ui']);
    host.cache.modules = [{ name: 'ESLint', npm: '@nuxt/eslint', compatibility: { nuxt: '>=3' } }];
    expect(request().map(item => item.label)).toEqual(['@nuxt/eslint']);
    expect(fetch).not.toHaveBeenCalled();
});
test('uses a bundled offline snapshot when cache is missing or corrupt', () => {
    host.cache = undefined;
    expect(request().some(item => item.label === '@nuxt/eslint')).toBe(true);
    host.cache = { modules: [] };
    expect(request().some(item => item.label === '@nuxt/eslint')).toBe(true);
});
test('cancellation, resource-specific toggle and unrelated files suppress suggestions', () => {
    expect(request('/project/other.ts')).toEqual([]);
    expect(request(undefined, true)).toEqual([]);
    host.enabled = false; expect(request()).toEqual([]);
    host.enabled = true; expect(request()).toHaveLength(1);
});
test('unknown compatibility retains useful metadata and unsafe catalogue URLs fall back to npm', () => {
    host.version = 'catalog:unknown'; host.cache.modules[0].website = 'command:unsafe'; host.cache.modules[0].github = 'javascript:unsafe';
    const result = request()[0];
    expect(result.detail).toContain('^3 || ^4');
    expect(result.insertText).toBe('@nuxt/ui');
    expect((result.documentation as any).value).toContain('https://www.npmjs.com/package/@nuxt/ui');
    expect((result.documentation as any).value).not.toContain('command:');
});
