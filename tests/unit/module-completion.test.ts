/** Verify syntax-aware module completion excludes nested settings, tuple options, comments and incompatible or duplicate modules. */
import { expect, test } from 'vitest';
import { normalizeCatalogue } from '../../src/core/catalogue';
import { moduleCompletionCandidates, moduleCompletionContext } from '../../src/core/moduleCompletion';
/** Put a cursor marker in source so tests exercise actual config syntax and replacement offsets. */
function context (source: string) { const cursor = source.indexOf('|'); return moduleCompletionContext(source.replace('|', ''), cursor); }
test('completes quoted names and excludes duplicate existing string/tuple declarations', () => {
    const value = context('export default defineNuxtConfig({ modules: ["@nuxt/|ui", "@nuxt/eslint", ["@pinia/nuxt", {}]] })');
    expect(value?.prefix).toBe('@nuxt/');
    expect(value?.quoted).toBe(true);
    expect(value?.configured).toEqual(['@nuxt/eslint', '@pinia/nuxt']);
    const source = 'export default defineNuxtConfig({modules:["@nuxt/|ui"]})';
    const result = context(source)!;
    expect(source.replace('|', '').slice(result.start, result.end)).toBe('@nuxt/ui');
});
test('supports blank direct array positions and tuple first entries with correct quoting', () => {
    expect(context('export default { modules: [|] }')?.quoted).toBe(false);
    expect(context('export default { "modules": ["@nuxt/ui", /* installed */ |] }')?.configured).toEqual(['@nuxt/ui']);
    expect(context('export default { modules: [[|, {}]] }')?.quoted).toBe(false);
    expect(context('export default { modules: [["@pinia/|nuxt", {}]] }')?.quoted).toBe(true);
});
test('repairs an unfinished package string without evaluating the configuration', () => {
    expect(context('export default defineNuxtConfig({modules: ["@nuxt/|]})')?.prefix).toBe('@nuxt/');
});
test.each([
    'export default { css: ["@nuxt/|"] }',
    'export default { nested: { modules: ["@nuxt/|"] } }',
    'export default { modules: [["@pinia/nuxt", { name: "@nuxt/|" }]] }',
    'export default { modules: [["@pinia/nuxt", |{}]] }',
    'export default { modules: [/* @nuxt/| */] }',
    'export default { modules: [// @nuxt/|\n] }',
    'export default { modules: getModules("@nuxt/|") }',
    'export default getConfig({modules:["@nuxt/|"]}) + otherConfig',
    'export default { ["modules"]: ["@nuxt/|"] }',
])('suppresses completions in unsupported syntax: %s', source => { expect(context(source)).toBeUndefined(); });
test('uses real compatibility ranges, canonical names, offline metadata and excludes layers/duplicates', () => {
    const modules = normalizeCatalogue([
        { npm: '@nuxt/ui', name: 'ui', type: 'official', compatibility: { nuxt: '^3 || ^4' } },
        { npm: '@nuxt/ui', name: 'duplicate', compatibility: { nuxt: '^3 || ^4' } },
        { npm: '@nuxt/old', name: 'old', compatibility: { nuxt: '^2' } },
        { npm: '@nuxt/layer', name: 'layer', isLayer: true },
        { npm: '@nuxt/eslint', name: 'eslint', compatibility: { nuxt: '>=3' } },
    ]);
    const value = context('export default {modules:["@nuxt/|", "@nuxt/eslint"]}')!;
    expect(moduleCompletionCandidates(modules, value, '4.6.1').map(module => module.npm)).toEqual(['@nuxt/ui']);
    expect(moduleCompletionCandidates(modules, value).map(module => module.npm)).toEqual(['@nuxt/ui', '@nuxt/old']);
});
