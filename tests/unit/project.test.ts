/** Regression coverage for nested and multiple Nuxt applications, issue #49. */
import { afterEach, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { containsPath, discoverProjects, projectForResource } from '../../src/core/project';
const folders: string[] = [];
afterEach(() => { for (const root of folders.splice(0)) { rmSync(root, { recursive: true, force: true }); } });
/** Create a temporary workspace that can be safely removed after each regression. */
function fixture () { const root = mkdtempSync(join(tmpdir(), 'nuxtr-project-')); folders.push(root); return root; }
it('discovers nested configs and workspace package-manager roots while ignoring generated and dependency folders', () => {
    const root = fixture();
    writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages: [apps/*]');
    for (const name of ['apps/a', 'apps/b', 'node_modules/ignored', '.nuxt/ignored']) {
        mkdirSync(join(root, name), { recursive: true });
        writeFileSync(join(root, name, 'nuxt.config.ts'), 'export default {}');
    }
    const projects = discoverProjects([root]);
    expect(projects).toHaveLength(2);
    expect(projects.every(project => project.packageManagerRoot === root)).toBe(true);
    expect(projectForResource(projects, join(root, 'apps/b/pages/index.vue'))?.root).toBe(join(root, 'apps/b'));
});
it('selects the deepest containing project and never confuses sibling name prefixes', () => {
    const root = fixture();
    writeFileSync(join(root, 'nuxt.config.js'), 'export default {}');
    mkdirSync(join(root, 'nested/.config'), { recursive: true });
    writeFileSync(join(root, 'nested/.config/nuxt.ts'), 'export default {}');
    const projects = discoverProjects([root]);
    expect(projectForResource(projects, join(root, 'nested/app.vue'))?.root).toBe(join(root, 'nested'));
    expect(containsPath(root, root + '-other/page.vue')).toBe(false);
    expect(projectForResource(projects)).toBeUndefined();
});
