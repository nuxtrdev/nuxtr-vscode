/** Regressions for scaffold language, optional naming and existing page/layout resource formats. */
import { expect, it } from 'vitest';
import { composableName, scaffoldFileName, templateKind } from '../../src/core/templates';
it('preserves defaults and removes duplicate Vue and TypeScript suffixes', () => {
    expect(scaffoldFileName('counter', 'composable')).toBe('counter.ts');
    expect(scaffoldFileName('Card.vue.vue', 'component')).toBe('Card.vue');
    expect(scaffoldFileName('users.get.ts', 'api', 'js')).toBe('users.get.js');
});
it('prefixes nested composable filenames once without truncating useful', () => {
    expect(scaffoldFileName('account/useCounter.ts', 'composable', 'js', true)).toBe('account/useCounter.js');
    expect(scaffoldFileName('useful', 'composable', 'ts', true)).toBe('useUseful.ts');
    expect(composableName('useCounter')).toBe('Counter');
});
it('recognizes every supported template suffix and rejects partial matches', () => {
    expect(templateKind('legacy.page-template')).toBe('page');
    expect(templateKind('custom.api-template')).toBe('api');
    expect(templateKind('custom.page-template.bak')).toBeUndefined();
});

it('avoids repeated use prefixes in exported names for nested files', () => {
    expect(composableName('account/useCounter.ts')).toBe('Counter');
});
