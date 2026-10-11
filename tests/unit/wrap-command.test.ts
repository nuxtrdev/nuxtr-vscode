/** Verify wrapper cancellation and stale-selection protection before applying editor changes. */
import { beforeEach, expect, test, vi } from 'vitest';
import { wrapWithNuxtComponent } from '../../src/commands/wrapComponent';
const host = vi.hoisted(() => ({ editor: undefined as any, pick: vi.fn() }));
vi.mock('vscode', () => ({ EndOfLine: { CRLF: 2 }, window: { get activeTextEditor () { return host.editor; }, showQuickPick: host.pick } }));
beforeEach(() => {
    const selection = { start: { offset: 10 }, end: { offset: 15 }, isEqual: (value: unknown) => value === selection };
    host.editor = { document: { languageId: 'vue', version: 1, eol: 1, getText: () => '<template>hello</template>', offsetAt: (position: any) => position.offset }, selections: [selection], options: { insertSpaces: true, tabSize: 2 }, edit: vi.fn().mockResolvedValue(true) };
    host.pick.mockReset();
});
test('cancellation leaves the editor untouched', async () => {
    host.pick.mockResolvedValue(undefined);
    await expect(wrapWithNuxtComponent()).resolves.toBe(false);
    expect(host.editor.edit).not.toHaveBeenCalled();
});
test('typing during the picker prevents a stale edit', async () => {
    host.pick.mockImplementation(() => { host.editor.document.version++; return { label: 'ClientOnly' }; });
    await expect(wrapWithNuxtComponent()).rejects.toThrow('changed');
    expect(host.editor.edit).not.toHaveBeenCalled();
});
test('changing the selection count during the picker prevents a stale edit', async () => {
    host.pick.mockImplementation(() => { host.editor.selections = []; return { label: 'ClientOnly' }; });
    await expect(wrapWithNuxtComponent()).rejects.toThrow('changed');
    expect(host.editor.edit).not.toHaveBeenCalled();
});
test('script and non-Vue selections are rejected before opening a picker', async () => {
    host.editor.document.languageId = 'typescript';
    await expect(wrapWithNuxtComponent()).rejects.toThrow('Vue');
    expect(host.pick).not.toHaveBeenCalled();
});
test('an editor context-menu resource opens the picker instead of becoming a component name', async () => {
    host.pick.mockResolvedValue({ label: 'ClientOnly' });
    await expect(wrapWithNuxtComponent({ fsPath: '/project/component.vue' } as any)).resolves.toBe(true);
    expect(host.pick).toHaveBeenCalledOnce();
    expect(host.editor.edit).toHaveBeenCalledOnce();
});
