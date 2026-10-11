/** Regression tests for complete output, empty outdated results, warnings, timeout and cancellation. */
import { expect, it } from 'vitest';
import { executeCommand } from '../../src/core/process';
/** Build an offline Node process fixture without a shell or registry. */
function nodeCommand (source: string, timeoutMs = 2000) { return { executable: process.execPath, args: ['-e', source], cwd: process.cwd(), timeoutMs }; }
it('collects all output chunks and permits warning stderr on success', async () => {
    const result = await executeCommand(nodeCommand('process.stdout.write("first"); process.stderr.write("warning"); setTimeout(() => process.stdout.write("last"), 15)'));
    expect(result.stdout).toBe('firstlast'); expect(result.stderr).toBe('warning'); expect(result.success).toBe(true);
});
it('settles empty successful output and expected outdated exit codes', async () => {
    expect((await executeCommand(nodeCommand(''))).stdout).toBe('');
    const command = { ...nodeCommand('process.stdout.write("{}");process.exitCode=1'), acceptedExitCodes: [0, 1] };
    expect((await executeCommand(command)).success).toBe(true);
});
it('reports failures and missing executables with complete diagnostics', async () => {
    expect((await executeCommand(nodeCommand('process.stderr.write("failure");process.exitCode=2'))).success).toBe(false);
    expect((await executeCommand({ executable: 'nuxtr-missing-executable', args: [], cwd: process.cwd() })).failure).toBe('spawn');
});
it('settles timeout and cancellation instead of hanging a loading indicator', async () => {
    expect((await executeCommand(nodeCommand('setInterval(()=>{},1000)', 80))).failure).toBe('timeout');
    const controller = new AbortController();
    const running = executeCommand(nodeCommand('setInterval(()=>{},1000)'), controller.signal);
    controller.abort();
    expect((await running).failure).toBe('cancelled');
});
