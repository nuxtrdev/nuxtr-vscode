/** Own shell lifecycle listeners and route terminal actions to a fresh or safely reusable project terminal. */
import { ExtensionContext, Terminal, TerminalShellExecution, ThemeIcon, Uri, window, workspace } from 'vscode';
import { TerminalPool, terminalPathKey } from '../core/terminals';
import { currentProject } from './project';
const pool = new TerminalPool<Terminal, TerminalShellExecution>();

/** Register shell-integration observations once and discard bookkeeping when the extension is deactivated. */
export function activateTerminals (context: ExtensionContext): void {
    context.subscriptions.push(
        window.onDidStartTerminalShellExecution(event => pool.start(event.terminal, event.execution)),
        window.onDidEndTerminalShellExecution(event => pool.end(event.terminal, event.execution, typeof event.exitCode === 'number')),
        window.onDidChangeTerminalShellIntegration(event => pool.invalidate(event.terminal)),
        window.onDidCloseTerminal(terminal => pool.forget(terminal)),
        { dispose: () => pool.clear() },
    );
}

/** Reuse only an owned, observed idle terminal whose reported directory still matches; default to a fresh terminal. */
export function newProjectTerminal (name: string, command: string, cwd?: string): Terminal {
    const project = currentProject();
    const directory = cwd || project.root;
    const reuse = workspace.getConfiguration('nuxtr', Uri.file(project.root)).get<boolean>('terminal.reuse', false);
    const existing = reuse ? pool.reserve(project.root, directory, terminal => Boolean(
        !terminal.exitStatus && terminal.shellIntegration?.cwd?.scheme === 'file'
        && terminalPathKey(terminal.shellIntegration.cwd.fsPath) === terminalPathKey(directory))) : undefined;
    const terminal = existing || window.createTerminal({ name, cwd: directory, ...(process.platform === 'win32' ? { shellPath: 'powershell.exe' } : {}), iconPath: new ThemeIcon('nuxt-logo') });
    if (!existing) { pool.own(terminal, project.root, directory); }
    // sendText never interrupts a running command. Unknown/busy terminals never reach this dispatch.
    terminal.sendText(command);
    terminal.show();
    return terminal;
}
