import * as vscode from 'vscode';
import * as nuxtRcSchema from '../schemas/nuxt.schema.json';

function completionItem (propertyName: string, property: any) {
    const snippet = new vscode.CompletionItem(propertyName);
    snippet.detail = property.title || '';
    snippet.label = propertyName;
    snippet.kind = vscode.CompletionItemKind.Property;

    snippet.documentation = new vscode.MarkdownString(
        `[Nuxt Documentation](https://nuxt.com/docs/api/configuration/nuxt-config#${propertyName})`
    );

    snippet.preselect = true;

    if (property.type === 'boolean') {
        snippet.insertText = new vscode.SnippetString(`${propertyName}=\${1|true,false|}`);
    } else if (property.type === 'string') {
        snippet.insertText = new vscode.SnippetString(`${propertyName}=\${1:}`);
    } else if (property.type === 'object' && !property.properties) {
        snippet.insertText = new vscode.SnippetString(`${propertyName}=\${1:}`);
    }

    return snippet;
}


export class CustomCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
        let linePrefix = document.lineAt(position).text.substr(0, position.character);

        if (/^[_.\s]/.test(linePrefix)) {
            return [];
        }

        if (linePrefix.endsWith('.')) {
            let propertyName = linePrefix.slice(0, -1);
            console.log("Property Name:", propertyName);

        }

        if (!linePrefix.endsWith('.')) {
            console.log("linePrefix:", linePrefix);

            return Object.keys(nuxtRcSchema.properties)
                .filter(propertyName => !propertyName.startsWith('_'))
                .map(propertyName => {
                    // @ts-ignore
                    let property = nuxtRcSchema.properties[propertyName];
                    return completionItem(propertyName, property);
                });
        }

        return [];
    }
}
