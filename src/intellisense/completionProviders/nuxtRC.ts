import * as vscode from 'vscode';
import * as nuxtRcSchemaJson from "@nuxt/schema/schema/config.schema.json";
import type { ConfigurationProperty } from '../../types';

const nuxtRcSchema = nuxtRcSchemaJson as { properties: { [key: string]: ConfigurationProperty } };

const autoImportProperty: ConfigurationProperty = {
    type: "boolean",
    id: "#imports/autoImport",
    default: true,
    title: "Enable implicit auto import from Vue, Nuxt, and module contributed utilities. Generate global TypeScript definitions.",
    markdownType: "SrcTypesImportsImportsOptions"
};

const transformProperty: ConfigurationProperty = {
    type: "object",
    id: "#imports/transform",
    properties: {
        exclude: {
            type: "array",
        },
        include: {
            type: "array",
        }
    }
};

const timingProperty: ConfigurationProperty = {
    type: "boolean",
    id: "#nitro/timing",
    default: true,
    title: "Enable timing information for each build step.",
    markdownType: "SrcTypesNitroNitroOptions"
};


function createCompletionItem(propertyName: string, property: ConfigurationProperty) {
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
        snippet.insertText = new vscode.SnippetString(`${propertyName}`);
    } else if (property.type === 'any' && !property.properties) {
        snippet.insertText = new vscode.SnippetString(`${propertyName}=\${1:}`);
    }

    return snippet;
}


export class CustomCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const linePrefix = document.lineAt(position).text.slice(0, position.character);

        const completionItems =  Object.keys(nuxtRcSchema.properties)
            .filter(propertyName => propertyName.startsWith(linePrefix) && !propertyName.startsWith('_'))
            .map(propertyName => {
                const property = nuxtRcSchema.properties[propertyName] as ConfigurationProperty;

                return createCompletionItem(propertyName, property);
            });


        if (!linePrefix.endsWith('.')) {
            return completionItems;
        } else {
            const propertyPath = linePrefix.slice(0, linePrefix.length - 1);

            const property = nuxtRcSchema.properties[propertyPath];
            if (property && property.type === 'object' && property.properties) {
                const nestedProperties = property.properties;
                const nestedCompletionItems = Object.keys(nestedProperties).map(propertyName => {
                    const nestedProperty = nestedProperties[propertyName] as ConfigurationProperty;
                    return createCompletionItem(`${propertyName}`, nestedProperty);
                });

                if (propertyPath ===  'imports') {
                    nestedCompletionItems.push(createCompletionItem("autoImport", autoImportProperty));
                    nestedCompletionItems.push(createCompletionItem("transform", transformProperty));
                }

                if (propertyPath === 'nitro') {
                    nestedCompletionItems.push(createCompletionItem("timing", timingProperty));
                }

                return nestedCompletionItems;
            }
            return [];
        }
    }
}
