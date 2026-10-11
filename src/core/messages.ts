/** Validate sidebar requests before they reach project commands, filesystem edits or external navigation. */
import type { CataloguePayload } from './catalogue';
import type { ModuleMetadata } from './modules';

export type SidebarRequest =
    | { command: 'installModule'; module: ModuleMetadata }
    | { command: 'upgradeModule' | 'removeModule'; module: string }
    | { command: 'openPackageReleaseNotes'; name: string }
    | { command: 'runAction'; script: string }
    | { command: 'editSnippet' | 'deleteSnippet' | 'editTemplate' | 'deleteTemplate' | 'createFileFromTemplate'; data: string }
    | { command: 'configureNewSnippet' | 'createEmptyFileTemplate' | 'ready' | 'refreshCatalogue' }
    | { command: 'openExternal'; url: string };
export type SidebarEvent = { command: 'projectView' | 'modules' | 'addModule' | 'addLayer' }
    | { command: 'projectViewData' | 'outdatedDependencies' | 'installedModules'; data: unknown }
    | { command: 'moduleCatalogue'; data: CataloguePayload }
    | { command: 'moduleInstalled'; installed: boolean; configured: boolean; cmd: string; error?: string };

/** Allow public HTTPS links without embedded credentials or executable URL schemes. */
export function safeExternalUrl (value: unknown): value is string {
    if (typeof value !== 'string' || value.length > 2048) { return false; }
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}

/** Keep resource actions inside .vscode and require the expected snippet/template suffix. */
export function projectResourceName (value: unknown, snippet = false): value is string {
    return typeof value === 'string' && value.length < 256 && !/[\\/]/.test(value) && !value.startsWith('.')
        && (snippet ? /^[\w .-]+\.code-snippets$/ : /^[\w .-]+\.(?:page|layout|component|composable|api)-template$/).test(value);
}

/** Parse a discriminated request, returning undefined for malformed or unknown messages. */
export function parseSidebarRequest (value: unknown): SidebarRequest | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { return; }
    const message = value as Record<string, any>;
    const packageName = /^(?:@[a-z\d._~-]+\/)?[a-z\d._~-]+$/i;
    switch (message.command) {
        case 'installModule': {
            if (!message.module || typeof message.module !== 'object' || typeof message.module.npm !== 'string' || !packageName.test(message.module.npm)) { return; }
            const module = message.module;
            if (module.runtime !== undefined && typeof module.runtime !== 'boolean') { return; }
            if (['dependency-type', 'dependencyType'].some(key => module[key] !== undefined && typeof module[key] !== 'string')) { return; }
            return { command: 'installModule', module: { npm: module.npm, runtime: module.runtime, dependencyType: module.dependencyType, 'dependency-type': module['dependency-type'] } };
        }
        case 'upgradeModule': case 'removeModule': {
            return typeof message.module === 'string' && packageName.test(message.module) ? { command: message.command, module: message.module } : undefined;
        }
        case 'openPackageReleaseNotes': { return typeof message.name === 'string' && packageName.test(message.name) ? { command: 'openPackageReleaseNotes', name: message.name } : undefined; }
        case 'runAction': {
            return typeof message.script === 'string' && message.script.length > 0 && message.script.length < 256 ? { command: 'runAction', script: message.script } : undefined;
        }
        case 'editSnippet': case 'deleteSnippet': case 'editTemplate': case 'deleteTemplate': case 'createFileFromTemplate': {
            return projectResourceName(message.data, message.command.endsWith('Snippet')) ? { command: message.command, data: message.data } : undefined;
        }
        case 'configureNewSnippet': case 'createEmptyFileTemplate': case 'ready': case 'refreshCatalogue': { return { command: message.command }; }
        case 'openExternal': { return safeExternalUrl(message.url) ? { command: 'openExternal', url: message.url } : undefined; }
    }
}
