/** Complete Nuxt module package names from the shared persisted catalogue and offline snapshot without network requests. */
import { CancellationToken, CompletionItem, CompletionItemKind, CompletionItemProvider, MarkdownString, Memento, Position, Range, TextDocument, workspace } from 'vscode';
import { relative } from 'node:path';
import { moduleCompletionCandidates, moduleCompletionContext } from '../../core/moduleCompletion';
import { cachedCatalogue } from '../../services/catalogue';
import { currentProject, withProject } from '../../services/project';
import { getNuxtVersion } from '../../utils/nuxt';

export class NuxtModulesCompletionProvider implements CompletionItemProvider {
    /** Share the sidebar's cache storage, falling back to the bundled catalogue when offline. */
    constructor (private readonly storage: Memento) {}

    /** Offer module names only in the selected project's configuration and honor scoped settings/cancellation per request. */
    provideCompletionItems (document: TextDocument, position: Position, token: CancellationToken): CompletionItem[] {
        if (token.isCancellationRequested || !workspace.getConfiguration('nuxtr', document.uri).get('intellisense.nuxtModules', true)) { return []; }
        try {
            const project = currentProject(document.uri);
            if (relative(document.uri.fsPath, project.configPath) !== '') { return []; }
            const context = moduleCompletionContext(document.getText(), document.offsetAt(position));
            if (!context) { return []; }
            let version: string | undefined;
            try { version = withProject(project, getNuxtVersion); } catch { /* Unknown versions retain suggestions with their compatibility ranges visible. */ }
            const catalogue = cachedCatalogue(this.storage);
            const modules = moduleCompletionCandidates(catalogue.modules, context, version);
            if (token.isCancellationRequested) { return []; }
            return modules.map(module => {
                const item = new CompletionItem(module.npm, CompletionItemKind.Module);
                item.range = new Range(document.positionAt(context.start), document.positionAt(context.end));
                item.insertText = context.quoted ? module.npm : `'${module.npm}'`;
                item.filterText = module.npm;
                item.sortText = (module.type === 'official' ? '0' : '1') + module.npm;
                item.detail = `${module.name} — Nuxt ${module.compatibility.nuxt || 'compatibility unspecified'}`;
                item.documentation = new MarkdownString().appendText(module.description).appendText(`\n\nCatalogue: ${catalogue.source}${catalogue.stale ? ' (offline/stale)' : ''}.`);
                item.documentation.appendMarkdown(`\n\n[Module documentation](${module.website || module.github})`);
                return item;
            });
        } catch { return []; }
    }
}
