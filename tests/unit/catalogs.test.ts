/** Regressions for pnpm default/named catalogs and non-semver declarations, issue #196. */
import { afterEach, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyCatalogUpdate, prepareCatalogUpdate, resolveDependency } from '../../src/core/catalogs';
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }); } });
/** Create a workspace with default and named catalogs while preserving YAML comments for update checks. */
function fixture () {
    const root = mkdtempSync(join(tmpdir(), 'nuxtr-catalog-')); roots.push(root);
    writeFileSync(join(root, 'pnpm-workspace.yaml'), '# Workspace catalog\ncatalog:\n  nuxt: ^3.21.11 # Keep this comment\ncatalogs:\n  modern:\n    nuxt: ^4.6.1\n');
    mkdirSync(join(root, 'apps/web'), { recursive: true });
    return { root, project: join(root, 'apps/web') };
}
it('resolves default and named catalogs from a parent workspace', () => {
    const { project } = fixture();
    expect(resolveDependency(project, 'nuxt', 'catalog:').version).toBe('3.21.11');
    expect(resolveDependency(project, 'nuxt', 'catalog:modern').version).toBe('4.6.1');
});
it('does not pass missing references or non-semver declarations to semver', () => {
    const { project } = fixture();
    for (const specifier of ['catalog:missing', 'workspace:*', 'github:nuxt/nuxt', 'latest', 'file:../nuxt']) {
        expect(resolveDependency(project, 'nuxt', specifier).version).toBeUndefined();
    }
});
it('prepares a comment-preserving YAML edit without changing package manifest catalog references', () => {
    const { project } = fixture();
    const update = prepareCatalogUpdate(project, 'nuxt', 'catalog:', '4.6.1');
    expect(update.updated).toContain('nuxt: ^4.6.1 # Keep this comment');
    expect(update.original).toContain('nuxt: ^3.21.11');
    expect(() => prepareCatalogUpdate(project, 'nuxt', 'catalog:modern', 'latest')).toThrow(/version/);
});

it('restores failed catalog edits while retaining a concurrent external change', async () => {
    const { project } = fixture();
    const update = prepareCatalogUpdate(project, 'nuxt', 'catalog:default', '4.6.1');
    await expect(applyCatalogUpdate(update, () => Promise.reject(new Error('installation failed')))).rejects.toThrow('installation failed');
    expect(readFileSync(update.file, 'utf8')).toBe(update.original);
    await expect(applyCatalogUpdate(update, () => {
        writeFileSync(update.file, '# External edit\n' + update.updated);
        return Promise.reject(new Error('installation failed'));
    })).rejects.toThrow('installation failed');
    expect(readFileSync(update.file, 'utf8')).toContain('# External edit');
});
