/** Verify diagnostics are previewed before opt-in copying and notifications cannot block command completion. */
import { beforeEach, expect, test, vi } from 'vitest';
import { projectHealthCheck } from '../../src/commands/projectHealth';
const host = vi.hoisted(() => ({ open: vi.fn(), show: vi.fn(), notify: vi.fn(), copy: vi.fn(), error: vi.fn() }));
vi.mock('vscode', () => ({
    env: { clipboard: { writeText: host.copy } }, version: '1.141.0', extensions: { all: [] },
    workspace: { openTextDocument: host.open }, window: { showTextDocument: host.show, showInformationMessage: host.notify, showErrorMessage: host.error },
}));
vi.mock('../../src/utils/global', () => ({ nuxtrConfiguration: () => ({ defaultPackageManager: 'pnpm' }) }));
vi.mock('../../src/services/project', () => ({ currentProject: () => ({ root: '/private/project' }) }));
vi.mock('../../src/core/health', () => ({ inspectProjectHealth: () => ({}), formatHealthReport: () => '# Safe diagnostics' }));
beforeEach(() => { vi.clearAllMocks(); host.open.mockResolvedValue({}); host.show.mockResolvedValue(undefined); host.copy.mockResolvedValue(undefined); });
test('a notification left open does not block the command or copy without consent', async () => {
    host.notify.mockReturnValue(new Promise(() => {}));
    await expect(projectHealthCheck()).resolves.toBe('# Safe diagnostics');
    expect(host.show).toHaveBeenCalled();
    expect(host.show.mock.invocationCallOrder[0]).toBeLessThan(host.notify.mock.invocationCallOrder[0]);
    expect(host.copy).not.toHaveBeenCalled();
});
test('explicit copy uses only the already previewed report', async () => {
    host.notify.mockResolvedValue('Copy diagnostics');
    await projectHealthCheck();
    await vi.waitFor(() => expect(host.copy).toHaveBeenCalledWith('# Safe diagnostics'));
});
test('dismissal does not copy and clipboard failures are handled separately', async () => {
    host.notify.mockResolvedValue(undefined);
    await projectHealthCheck();
    expect(host.copy).not.toHaveBeenCalled();
    host.notify.mockResolvedValue('Copy diagnostics'); host.copy.mockRejectedValue(new Error('Denied'));
    await expect(projectHealthCheck()).resolves.toBe('# Safe diagnostics');
    await vi.waitFor(() => expect(host.error).toHaveBeenCalled());
});
