/** File-generation regressions for indentation, duplicate suffixes and safe Pinia/Nitro scaffolds (#172). */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { formatGeneratedContent, normalizedExtension, normalizedIdentifier, piniaOptionsTemplate, serverMiddlewareTemplate, writeNewFile } from '../../src/core/generated';
it('normalizes duplicate extensions once while preserving route qualifiers', () => {
    expect(normalizedExtension('card.vue.vue', '.vue')).toBe('card');
    expect(normalizedExtension('users.get.ts.ts', '.ts')).toBe('users.get');
    expect(normalizedExtension('card.vue.test', '.vue')).toBe('card.vue.test');
    expect(normalizedIdentifier('my-store.ts')).toBe('MyStore');
});
it('honors four-space indentation, tabs and requested line endings', () => {
    const source = 'function sample() {\n  if (true) {\n    return 1\n  }\n}\n';
    expect(formatGeneratedContent(source, true, 4, '\n')).toContain('        return 1');
    expect(formatGeneratedContent(source, false, 4, '\r\n')).toContain('\r\n\t\treturn 1');
});
it('uses the current Pinia store signature and keeps server middleware from ending responses', () => {
    expect(piniaOptionsTemplate('sample')).toContain('defineStore(\'SampleStore\', {');
    expect(piniaOptionsTemplate('sample')).not.toContain('id:');
    expect(serverMiddlewareTemplate).not.toContain('return');
});

it('awaits nested parents and protects existing files from concurrent writes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'nuxtr-write-'));
    try {
        const file = join(root, 'nested/deep/sample.ts');
        const results = await Promise.all([writeNewFile(file, 'first'), writeNewFile(file, 'second')]);
        expect(results.filter(Boolean)).toHaveLength(1);
        expect(['first', 'second']).toContain(await readFile(file, 'utf8'));
        expect(await writeNewFile(file, 'replacement')).toBe(false);
    } finally { await rm(root, { recursive: true, force: true }); }
});
