/** Decode packaged VS Code snippets and detect import contexts where boilerplate insertion is inappropriate. */
import { containsPath } from './project';
import { gte, minVersion } from 'semver';
export interface ParsedSnippet { name: string; prefixes: string[]; body: string; description: string; fileTemplate: boolean; documentation?: string; minimumNuxtVersion?: string; }

/** Hide newer framework APIs when the project's declared version cannot meet their documented requirement. */
export function snippetSupportsNuxt (snippet: ParsedSnippet, version?: string): boolean {
    if (!snippet.minimumNuxtVersion) { return true; }
    try {
        const resolved = version && minVersion(version);
        return Boolean(resolved && gte(resolved, snippet.minimumNuxtVersion));
    } catch { return false; }
}

/** Restrict H3 helpers to server JavaScript/TypeScript, using the resolved directory rather than its name. */
export function isServerSnippetContext (language: string, documentPath: string, serverDirectory: string): boolean {
    return ['javascript', 'typescript'].includes(language) && containsPath(serverDirectory, documentPath);
}

/** Validate snippet JSON and preserve standard alternate prefixes, multiline bodies and tab stops. */
export function parseSnippets (value: Record<string, any>): ParsedSnippet[] {
    const result: ParsedSnippet[] = [];
    for (const [name, snippet] of Object.entries(value)) {
        const prefixes: unknown[] = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
        const body = Array.isArray(snippet.body) ? snippet.body.join('\n') : snippet.body;
        if (!prefixes.every(prefix => typeof prefix === 'string') || typeof body !== 'string') { throw new Error(`Invalid packaged snippet: ${name}`); }
        result.push({ name, prefixes, body, description: Array.isArray(snippet.description) ? snippet.description.join('\n') : snippet.description || name, fileTemplate: Boolean(snippet.isFileTemplate), documentation: snippet.documentation, minimumNuxtVersion: snippet.minimumNuxtVersion });
    }
    return result;
}

/** Recognize unfinished single/multiline imports while permitting normal lines after completed imports. */
export function isImportContext (beforeCursor: string): boolean {
    const imports = [...beforeCursor.matchAll(/^\s*import(?:\s|[{"'(])/gm)];
    const last = imports.at(-1);
    if (!last) { return false; }
    const tail = beforeCursor.slice(last.index);
    if (/\bfrom\s*(["'])[^"']+\1|^\s*import\s*(["'])[^"']+\2|\bimport\s*\([^)]*\)/.test(tail)) { return false; }
    return !/\n\s*(?:const|let|function|export|<template>)\b/.test(tail);
}
