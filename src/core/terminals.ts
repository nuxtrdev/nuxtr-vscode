/** Track Nuxtr-owned terminal executions so only confirmed idle terminals can be reserved for the same project and directory. */
import { resolve } from 'node:path';
interface TerminalState<E> { project: string; cwd: string; pending: boolean; confirmed: boolean; uncertain: boolean; executions: Set<E>; }

/** Normalize directory keys using the host platform's path and case conventions. */
export function terminalPathKey (path: string): string {
    const normalized = resolve(path);
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

export class TerminalPool<T, E> {
    private readonly entries = new Map<T, TerminalState<E>>();

    /** Register only a newly created Nuxtr terminal, reserved for its first command. */
    own (terminal: T, project: string, cwd: string): void {
        this.entries.set(terminal, { project: terminalPathKey(project), cwd: terminalPathKey(cwd), pending: true, confirmed: false, uncertain: false, executions: new Set() });
    }

    /** Track extension and manually started commands in owned terminals, including overlapping shell executions. */
    start (terminal: T, execution: E): void {
        const state = this.entries.get(terminal);
        if (!state) { return; }
        if (state.executions.size === 0) { state.uncertain = false; }
        state.executions.add(execution);
        state.pending = false;
        state.confirmed = false;
    }

    /** Confirm idle only after all observed executions finish with reliable shell-integration results. */
    end (terminal: T, execution: E, reliable = true): void {
        const state = this.entries.get(terminal);
        if (!state || !state.executions.delete(execution)) { return; }
        if (!reliable) { state.uncertain = true; }
        state.confirmed = state.executions.size === 0 && !state.pending && !state.uncertain;
    }

    /** Reserve an idle terminal before dispatch to prevent consecutive requests from sharing a pending command. */
    reserve (project: string, cwd: string, eligible: (terminal: T) => boolean): T | undefined {
        for (const [terminal, state] of this.entries) {
            if (state.project === terminalPathKey(project) && state.cwd === terminalPathKey(cwd) && state.confirmed && !state.pending && state.executions.size === 0 && eligible(terminal)) {
                state.pending = true;
                state.confirmed = false;
                return terminal;
            }
        }
    }

    /** Forget stale shell observations when shell integration changes or a shell restarts. */
    invalidate (terminal: T): void {
        const state = this.entries.get(terminal);
        if (state) { state.executions.clear(); state.pending = true; state.confirmed = false; }
    }

    /** Remove a closed terminal without touching terminals owned by users or other extensions. */
    forget (terminal: T): void { this.entries.delete(terminal); }

    /** Release bookkeeping on extension disposal while allowing running user-visible commands to finish. */
    clear (): void { this.entries.clear(); }
}
