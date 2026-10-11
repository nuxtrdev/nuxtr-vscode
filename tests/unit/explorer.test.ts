/** Regressions for application/server Explorer actions and safe configured-folder matching. */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';
import { explorerFolders } from '../../src/core/explorer';
import { resolveDirectories } from '../../src/core/directories';

const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const menus = manifest.contributes.menus['explorer/context'];
it('offers project structure on discovered project roots and resolved application folders', () => {
    const action = menus.find((menu: any) => menu.command === 'nuxtr.projectStructure');
    expect(action.when).toContain('explorerResourceIsFolder');
    expect(action.when).toContain('resourcePath in nuxtr.projectRoots');
    expect(action.when).toContain('resourcePath in nuxtr.applicationDirectories');
});
it('matches modern, custom and nested layouts without matching unrelated app/server names', () => {
    const root = resolve('/workspace');
    const projects = ['web', 'admin', 'unresolved'].map(name => ({ root: join(root, 'apps', name), configPath: '', workspaceRoot: root, packageManagerRoot: root }));
    const folders = explorerFolders(projects, project => {
        if (project.root.endsWith('unresolved')) { throw new Error('Computed configuration'); }
        return resolveDirectories(project.root, project.root.endsWith('admin') ? { srcDir: 'source', serverDir: 'backend' } : {}, 4, () => true, () => ['app.vue']);
    });
    expect(folders.projectRoots).toEqual(projects.map(project => project.root));
    expect(folders.applicationDirectories).toEqual([join(projects[0].root, 'app'), join(projects[1].root, 'source')]);
    expect(folders.serverDirectories).toEqual([join(projects[0].root, 'server'), join(projects[1].root, 'backend')]);
    expect(folders.applicationDirectories).not.toContain(join(projects[0].root, 'components/app'));
    expect(folders.serverDirectories).not.toContain(join(root, 'unrelated/server'));
});
it('clears folder contexts when no Nuxt project remains', () => {
    expect(explorerFolders([], () => { throw new Error('Must not resolve without projects'); })).toEqual({ projectRoots: [], applicationDirectories: [], serverDirectories: [] });
});
it('offers API and server utility creation on the resolved server folder', () => {
    for (const command of ['nuxtr.createNitroAPI', 'nuxtr.createNitroUtil']) {
        const action = menus.find((menu: any) => menu.command === command);
        expect(action?.when).toContain('explorerResourceIsFolder');
        expect(action?.when).toContain('resourcePath in nuxtr.serverDirectories');
    }
});
