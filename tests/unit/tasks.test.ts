/** Regressions for nested task names, generation-specific imports and explicit experimental opt-in. */
import { expect, it } from 'vitest';
import { enableTasksSource, nitroTaskTemplate, taskIdentity } from '../../src/core/tasks';
it('normalizes nested task names and rejects traversal and invalid segments', () => {
    expect(taskIdentity('db:migrate.ts')).toEqual({ path: 'db/migrate', name: 'db:migrate' });
    expect(() => taskIdentity('../escape')).toThrow();
    expect(() => taskIdentity('db//migrate')).toThrow();
});
it('uses generation-specific helpers and nested runtime names', () => {
    expect(nitroTaskTemplate('db/migrate', 2)).not.toContain('from \'nitro/task\'');
    expect(nitroTaskTemplate('db/migrate', 3)).toContain('from \'nitro/task\'');
    expect(nitroTaskTemplate('db/migrate', 2)).toContain('name: \'db:migrate\'');
});
it('preserves existing Nitro options/comments and makes enabling tasks idempotent', () => {
    const source = '/** Keep this project comment. */\nexport default defineNuxtConfig({ nitro: { preset: "node-server" } })';
    const enabled = enableTasksSource(source);
    expect(enabled).toContain('Keep this project comment');
    expect(enabled).toContain('node-server');
    expect(enabled).toContain('tasks: true');
    expect(enableTasksSource(enabled)).toBe(enabled);
});
