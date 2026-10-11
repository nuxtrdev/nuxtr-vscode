/** Execute typed child commands, collecting complete output and settling cancellation, timeout and failure. */
import { spawn } from 'node:child_process';
export interface ProcessCommand { executable: string; args: string[]; cwd: string; acceptedExitCodes?: number[]; timeoutMs?: number; }
export interface ProcessResult { stdout: string; stderr: string; exitCode: number | null; signal: NodeJS.Signals | null; failure?: 'spawn' | 'timeout' | 'cancelled' | 'limit'; success: boolean; }

/** Run a command without a shell, waiting for all stdout/stderr and process close rather than the first chunk. */
export function executeCommand (command: ProcessCommand, signal?: AbortSignal): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
        let executable = command.executable;
        let args = command.args;
        const windowsManagerShim = process.platform === 'win32' && ['npm', 'pnpm', 'yarn'].includes(executable);
        if (windowsManagerShim) {
            if (args.some(arg => /["%!\r\n&|<>]/.test(arg))) { reject(new Error('Unsupported Windows command argument. Use the terminal to run this specification.')); return; }
            args = ['/d', '/s', '/c', [executable, ...args.map(arg => `"${arg}"`)].join(' ')];
            executable = 'cmd.exe';
        }
        if (signal?.aborted) { resolve({ stdout: '', stderr: '', exitCode: null, signal: null, failure: 'cancelled', success: false }); return; }
        // CMD consumes the quoting above; Node escaping it again gives managers literal quote characters.
        const child = spawn(executable, args, { cwd: command.cwd, windowsHide: true, windowsVerbatimArguments: windowsManagerShim, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
        const result: ProcessResult = { stdout: '', stderr: '', exitCode: null, signal: null, success: false };
        let killTimer: ReturnType<typeof setTimeout> | undefined;
        /** Stop the child and its Windows process tree, escalating if it ignores termination. */
        function stop (reason: ProcessResult['failure']) {
            if (result.failure) { return; }
            result.failure = reason;
            if (process.platform === 'win32' && child.pid) { spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true }); }
            else if (child.pid) { try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); } }
            killTimer = setTimeout(() => child.kill('SIGKILL'), 500);
            killTimer.unref();
        }
        /** Bound accumulated output so a broken CLI cannot exhaust the extension host. */
        function collect (key: 'stdout' | 'stderr', chunk: string) {
            result[key] += chunk;
            if (result.stdout.length + result.stderr.length > 8 * 1024 * 1024) { stop('limit'); }
        }
        child.stdout.setEncoding('utf8').on('data', chunk => collect('stdout', chunk));
        child.stderr.setEncoding('utf8').on('data', chunk => collect('stderr', chunk));
        const timer = setTimeout(() => stop('timeout'), command.timeoutMs ?? 120_000);
        /** Abort the running process when the caller cancels progress. */
        const cancel = () => stop('cancelled');
        signal?.addEventListener('abort', cancel, { once: true });
        if (signal?.aborted) { cancel(); }
        child.on('error', error => { result.failure = 'spawn'; result.stderr += error.message; });
        child.on('close', (code, terminated) => {
            clearTimeout(timer);
            clearTimeout(killTimer);
            signal?.removeEventListener('abort', cancel);
            result.exitCode = code;
            result.signal = terminated;
            result.success = !result.failure && code !== null && (command.acceptedExitCodes || [0]).includes(code);
            resolve(result);
        });
    });
}

/** Reject unsuccessful commands while preserving complete diagnostic output for the caller. */
export function requireSuccess (result: ProcessResult): ProcessResult {
    if (!result.success) { throw new Error(`Command ${result.failure || `exited ${result.exitCode}`}: ${result.stderr.trim() || result.stdout.trim()}`); }
    return result;
}
