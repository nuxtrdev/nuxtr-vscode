/** Load snippets from extension resources and own dynamic, project-scoped completion providers. */
import { CompletionItem, CompletionItemKind, ConfigurationTarget, ExtensionContext, MarkdownString, SnippetString, Uri, languages, workspace } from 'vscode';
import { ParsedSnippet, isImportContext, isServerSnippetContext, parseSnippets, snippetSupportsNuxt } from '../core/snippets';
import { currentProject, withProject } from '../services/project';
import { generateVueFileTemplate } from '../utils/files';
import { getNuxtVersion, projectDirectory } from '../utils/nuxt';
const resources = [
    { source: 'nuxt', file: 'components', languages: ['html', 'vue'], context: 'template' },
    { source: 'nuxt', file: 'boilerplates', languages: ['vue'], context: 'boilerplate' },
    { source: 'nuxt', file: 'composables', languages: ['javascript', 'typescript', 'vue'], context: 'script' },
    { source: 'nuxt', file: 'utils', languages: ['javascript', 'typescript', 'vue'], context: 'script' },
    { source: 'nitro', file: 'boilerplates', languages: ['javascript', 'typescript', 'vue'], context: 'script' },
    { source: 'nitro', file: 'utils', languages: ['javascript', 'typescript', 'vue'], context: 'script' },
    { source: 'nitro', file: 'h3', languages: ['javascript', 'typescript'], context: 'server' }
] as const;

/** Convert a bundled definition to a snippet completion without interpreting its tab stops as plain text. */
function completion (snippet: ParsedSnippet, prefix: string): CompletionItem {
    const item = new CompletionItem(prefix, CompletionItemKind.Snippet);
    item.detail = `Nuxtr: ${snippet.description}`;
    item.documentation = new MarkdownString().appendText(snippet.description).appendCodeblock(snippet.body);
    if (snippet.documentation) { item.documentation.appendMarkdown(`\n\n[Nuxt documentation](${snippet.documentation})`); }
    item.insertText = new SnippetString(snippet.body);
    return item;
}

/** Preserve the internal toggle API by updating settings instead of the installed extension manifest. */
export async function toggleSnippets (source: 'Nuxt' | 'Nitro', enabled: boolean) {
    await workspace.getConfiguration('nuxtr').update(`snippets.${source.toLowerCase()}`, enabled, ConfigurationTarget.Workspace);
}

/** Register owned providers using extensionUri, including remote hosts and case-sensitive installations. */
export async function activateSnippets (context: ExtensionContext) {
    for (const resource of resources) {
        const uri = Uri.joinPath(context.extensionUri, 'snippets', resource.source, resource.file + '.json');
        const definitions = parseSnippets(JSON.parse(Buffer.from(await workspace.fs.readFile(uri)).toString('utf8')));
        context.subscriptions.push(languages.registerCompletionItemProvider(resource.languages.map(language => ({ language })), {
            /** Read toggles for each request and suppress snippets in imports or inappropriate Vue regions. */
            provideCompletionItems (document, position) {
                if (!workspace.getConfiguration('nuxtr', document.uri).get(`snippets.${resource.source}`, true)) { return []; }
                const before = document.getText().slice(0, document.offsetAt(position));
                if (isImportContext(before)) { return []; }
                let version: string | undefined;
                try {
                    const project = currentProject(document.uri);
                    if (resource.context === 'server' && !withProject(project, () => isServerSnippetContext(document.languageId, document.uri.fsPath, projectDirectory('server')))) { return []; }
                    if (definitions.some(snippet => snippet.minimumNuxtVersion)) { version = withProject(project, getNuxtVersion); }
                } catch { return []; }
                const inScript = before.lastIndexOf('<script') > before.lastIndexOf('</script>');
                if (document.languageId === 'vue' && (resource.context === 'script' ? !inScript : resource.context === 'template' && inScript)) { return []; }
                if (resource.context === 'boilerplate' && !/^\s*[\w-]*$/.test(document.lineAt(position).text.slice(0, position.character))) { return []; }
                return definitions.filter(snippet => snippetSupportsNuxt(snippet, version)).flatMap(snippet => snippet.prefixes.map(prefix => completion(snippet, prefix)));
            }
        }));
    }
    context.subscriptions.push(languages.registerCompletionItemProvider({ language: 'vue' }, {
        /** Offer full Vue/layout templates only on ordinary blank/name lines when Nuxt snippets are enabled. */
        provideCompletionItems (document, position) {
            if (!workspace.getConfiguration('nuxtr', document.uri).get('snippets.nuxt', true)) { return []; }
            const before = document.getText().slice(0, document.offsetAt(position));
            if (isImportContext(before) || !/^\s*[\w-]*$/.test(document.lineAt(position).text.slice(0, position.character))) { return []; }
            try {
                return withProject(currentProject(document.uri), () => ['page', 'layout'].map(type => {
                    const body = generateVueFileTemplate(type as 'page' | 'layout');
                    const item = new CompletionItem(type === 'page' ? 'vueBase' : 'nuxtBaseLayout', CompletionItemKind.Snippet);
                    item.detail = 'Nuxtr: Generate a configured Vue template';
                    item.insertText = body;
                    item.documentation = new MarkdownString().appendCodeblock(body, 'vue');
                    return item;
                }));
            } catch { return []; }
        }
    }));
}
