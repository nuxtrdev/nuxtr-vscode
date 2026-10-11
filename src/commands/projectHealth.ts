/** Preview read-only project diagnostics and copy only after an explicit user action. */
import { env, extensions, version, window, workspace } from 'vscode';
import { formatHealthReport, inspectProjectHealth } from '../core/health';
import { currentProject } from '../services/project';
import { nuxtrConfiguration } from '../utils/global';

/** Open a diagnostics document before offering clipboard copy; never send diagnostics to an external service. */
export async function projectHealthCheck (): Promise<string> {
    const fallback = nuxtrConfiguration().defaultPackageManager;
    const report = inspectProjectHealth(currentProject(), fallback === 'null' ? 'NPM' : fallback);
    const extension = extensions.all.find(item => item.packageJSON.name === 'nuxtr-vscode');
    const content = formatHealthReport(report, version, extension?.packageJSON.version || 'unknown');
    const document = await workspace.openTextDocument({ language: 'markdown', content });
    await window.showTextDocument(document, { preview: true });
    // The command settles even if the user leaves the notification open.
    void window.showInformationMessage('Project health report opened. Review it before sharing.', 'Copy diagnostics').then(async selection => {
        if (selection === 'Copy diagnostics') { await env.clipboard.writeText(content); }
    }).then(undefined, () => { void window.showErrorMessage('Could not copy diagnostics. Copy the report from the editor instead.'); });
    return content;
}
