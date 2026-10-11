/** Regressions for Nuxt 3/4 source, server, public and custom directories, issue #150. */
import { expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { resolveDirectories } from '../../src/core/directories';
const root = resolve('/workspace/demo');
it('keeps Nuxt 3 server/public inside custom srcDir', () => {
    const dirs = resolveDirectories(root, { srcDir: 'src/' }, 3, () => false);
    expect(dirs.app).toBe(join(root, 'src'));
    expect(dirs.server).toBe(join(root, 'src/server'));
    expect(dirs.public).toBe(join(root, 'src/public'));
});
it('resolves Nuxt 4 app files separately from root server/public/shared/modules', () => {
    const dirs = resolveDirectories(root, {}, 4, path => path === join(root, 'app'));
    expect(dirs.pages).toBe(join(root, 'app/pages'));
    expect(dirs.server).toBe(join(root, 'server'));
    expect(dirs.public).toBe(join(root, 'public'));
    expect(dirs.shared).toBe(join(root, 'shared'));
    expect(dirs.modules).toBe(join(root, 'modules'));
});
it('honors Nuxt 3 compatibility version 4 and Nuxt 4 legacy detection', () => {
    expect(resolveDirectories(root, { future: { compatibilityVersion: 4 } }, 3, path => path === join(root, 'app')).app).toBe(join(root, 'app'));
    expect(resolveDirectories(root, {}, 4, () => false).app).toBe(root);
    expect(resolveDirectories(root, {}, 4, path => ['app', 'pages'].some(dir => path === join(root, dir)), () => []).app).toBe(root);
});
it('honors explicit application, server and public locations', () => {
    const dirs = resolveDirectories(root, { srcDir: 'source', serverDir: 'backend', dir: { pages: 'routes', public: 'static-files', shared: 'common' } }, 4, () => false);
    expect(dirs.pages).toBe(join(root, 'source/routes'));
    expect(dirs.server).toBe(join(root, 'backend'));
    expect(dirs.public).toBe(join(root, 'static-files'));
    expect(dirs.shared).toBe(join(root, 'common'));
});
it('rejects computed or inherited layouts instead of guessing a target', () => {
    expect(() => resolveDirectories(root, { srcDir: { $type: 'function-call' } }, 4, () => false)).toThrow(/literal/);
    expect(() => resolveDirectories(root, { extends: ['../layer'] }, 4, () => false)).toThrow(/inherited/);
});
