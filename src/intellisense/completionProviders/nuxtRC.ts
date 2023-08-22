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

function getPropertyByPath(schema: any, propertyPath: string): any {
    const pathParts = propertyPath.split('.');
    let currentProperty = schema;

    for (const pathPart of pathParts) {
        if (currentProperty && currentProperty.properties && currentProperty.properties[pathPart]) {
            currentProperty = currentProperty.properties[pathPart];
        } else {
            return null; // Property not found
        }
    }

    return currentProperty;
}

export class CustomCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);

        if (/^[_.\s]/.test(linePrefix)) {
            return [];
        }

        if (!linePrefix.endsWith('.')) {
            const prefix = linePrefix.trim();

            return Object.keys(nuxtRcSchema.properties)
                .filter(propertyName => propertyName.startsWith(prefix) && !propertyName.startsWith('_'))
                .map(propertyName => {
                    // @ts-ignore
                    const property = nuxtRcSchema.properties[propertyName];
                    return completionItem(propertyName, property);
                });
        } else {
            const parentPropertyPath = linePrefix.substr(0, linePrefix.lastIndexOf('.'));
            const parentPropertyName = parentPropertyPath.split('.').pop();

            // Find the parent property in the schema
            const parentProperty = getPropertyByPath(nuxtRcSchema.properties, parentPropertyPath);

            if (parentProperty && parentProperty.properties) {
                return Object.keys(parentProperty.properties)
                    // @ts-ignore
                    .filter(propertyName => propertyName.startsWith(parentPropertyName))
                    .map(propertyName => {
                        const property = parentProperty.properties[propertyName];
                        return completionItem(propertyName, property);
                    });
            }
        }

        return [];
    }
}
