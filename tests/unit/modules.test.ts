/** Module regressions for canonical names, comment preservation and installation/configuration failures (#189, #130). */
import { expect, it } from 'vitest';
import { editModuleConfig, installThenConfigure, moduleIsDevelopment } from '../../src/core/modules';
it('adds canonical names and preserves comments, existing options and module tuples', () => {
    const source = '// Keep comment\nexport default defineNuxtConfig({ modules: [[\'@pinia/nuxt\', { storesDirs: [\'stores\'] }]], css: [\'~/main.css\'] })';
    const result = editModuleConfig(source, { npm: '@nuxt/eslint' }, 'add');
    expect(result).toContain('// Keep comment'); expect(result).toContain('@nuxt/eslint'); expect(result).not.toContain('[object Object]');
    expect(result).toContain('storesDirs'); expect(result).toContain('~/main.css');
    expect(editModuleConfig(source, '@pinia/nuxt', 'add')).toBe(source);
});
it('removes tuple modules and uses extends for layers without rewriting other configuration', () => {
    const source = 'export default defineNuxtConfig({ modules: [[\'@pinia/nuxt\', {}]], extends: [\'old-layer\'] })';
    expect(editModuleConfig(source, '@pinia/nuxt', 'remove')).not.toContain('@pinia/nuxt');
    expect(editModuleConfig(source, { npm: 'new-layer' }, 'add', true)).toContain('new-layer');
    expect(() => editModuleConfig('export default makeConfig()', 'test-module', 'add')).toThrow();
});
it('defaults Nuxt modules to development dependencies and honors explicit runtime metadata', () => {
    expect(moduleIsDevelopment({ npm: '@nuxt/icon' })).toBe(true);
    expect(moduleIsDevelopment({ npm: 'runtime-module', 'dependency-type': 'runtime' })).toBe(false);
});
it('keeps installation failure separate from configuration failure and never configures failed installations', async () => {
    let configured = false;
    const failed = await installThenConfigure(() => Promise.reject(new Error('install')), () => { configured = true; });
    expect(failed.installed).toBe(false); expect(configured).toBe(false);
    const partial = await installThenConfigure(() => Promise.resolve(), () => { throw new Error('config'); });
    expect(partial).toMatchObject({ installed: true, configured: false });
});
