/** Regressions for untrusted sidebar messages, project path escapes and executable links. */
import { expect, it } from 'vitest';
import { parseSidebarRequest, safeExternalUrl } from '../../src/core/messages';

it('rejects malformed commands, shell package names and template path escapes', () => {
    for (const value of [null, [], {}, { command: 'installModule', module: { npm: 'nuxt; echo hacked' } }, { command: 'installModule', module: { npm: 'nuxt', runtime: 'yes' } }, { command: 'editTemplate', data: '../nuxt.config.ts' }, { command: 'deleteSnippet', data: 'C:\\secret.code-snippets' }, { command: 'openExternal', url: 'javascript:alert(1)' }]) { expect(parseSidebarRequest(value)).toBeUndefined(); }
});
it('accepts canonical modules, declared-script requests and local template basenames', () => {
    expect(parseSidebarRequest({ command: 'installModule', module: { npm: '@nuxt/eslint' } })?.command).toBe('installModule');
    expect(parseSidebarRequest({ command: 'runAction', script: 'build' })?.command).toBe('runAction');
    expect(parseSidebarRequest({ command: 'editTemplate', data: 'my component.component-template' })?.command).toBe('editTemplate');
    expect(safeExternalUrl('https://github.com/nuxtrdev/nuxtr-vscode/issues')).toBe(true);
    expect(safeExternalUrl('https://user:secret@github.com')).toBe(false);
});
