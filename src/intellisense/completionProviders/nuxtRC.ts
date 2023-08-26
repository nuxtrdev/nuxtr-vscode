import * as vscode from 'vscode';
import * as nuxtRcSchema from "@nuxt/schema/schema/config.schema.json";

function createCompletionItem (propertyName: string, property: any) {
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
    } else if (property.type === 'object' && property.properties) {
        const properties = Object.keys(property.properties).map(propName => {
            console.log('propName', propName);
            console.log('propertyName', propertyName);
            console.log('property.properties[propName]', property.properties[propName]);



            if (propName === propertyName) {
                const prop = property.properties[propName];
                return prop
            } else {
                return propName
            }
        }).join(',\n');
        snippet.insertText = new vscode.SnippetString(`${properties}`);
    } else if (property.type === 'any' && !property.properties) {
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
        let linePrefix = document.lineAt(position).text.substr(0, position.character);

        if (/^[_.\s]/.test(linePrefix)) {
            return [];
        }

        if (linePrefix.endsWith('.')) {
            const propertyName = linePrefix.split('.').pop();
            if (propertyName) {
                const property = getPropertyByPath(nuxtRcSchema, propertyName);
                if (property) {
                    return [createCompletionItem(propertyName, property)];
                }
            }
        }

        const prefix = linePrefix.trim();

        return Object.keys(nuxtRcSchema.properties)
            .filter(propertyName => propertyName.startsWith(prefix) && !propertyName.startsWith('_'))
            .map(propertyName => {
                // @ts-ignore
                const property = nuxtRcSchema.properties[propertyName];
                return createCompletionItem(propertyName, property);
            });
    }
}