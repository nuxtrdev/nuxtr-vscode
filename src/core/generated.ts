/** Normalize scaffold names, formatting and safe file writes; provide current Pinia/Nitro starter templates. */
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute } from 'node:path';

/** Remove repeated scaffold suffixes once without stripping route qualifiers or allowing parent traversal. */
export function normalizedExtension (name: string, extension: string): string {
    let result = name.trim();
    if (!result || isAbsolute(result) || result.split(/[\\/]/).includes('..') || /[<>:"|?*]/.test(result) || [...result].some(character => character.charCodeAt(0) < 32)) { throw new Error('Enter a relative file name without parent traversal or reserved filename characters.'); }
    const suffixes = ['.vue', '.ts', '.js', '.mts', '.cts', '.mjs', '.cjs', extension];
    while (true) {
        const suffix = suffixes.find(value => value && result.toLowerCase().endsWith(value.toLowerCase()));
        if (!suffix) { break; }
        result = result.slice(0, -suffix.length);
    }
    if (!result) { throw new Error('A file name is required before the extension.'); }
    return result;
}

/** Convert a scaffold filename to a valid PascalCase identifier, preserving meaningful route/name segments. */
export function normalizedIdentifier (name: string): string {
    const value = basename(normalizedExtension(name, '.ts')).split(/[^\w$]+/).filter(Boolean).map(part => part[0].toUpperCase() + part.slice(1)).join('') || 'Item';
    return /^\d/.test(value) ? '_' + value : value;
}

/** Convert relative indentation levels and EOLs using the effective editor's tab/space preference. */
export function formatGeneratedContent (content: string, insertSpaces: boolean, tabSize: number, eol: '\n' | '\r\n'): string {
    const lines = content.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
    const widths = lines.map(line => /^[\t ]+(?=\S)/.exec(line)?.[0]).filter(Boolean).map(indent => indent!.replaceAll('\t', '  ').length);
    const base = widths.length > 0 ? Math.min(...widths) : 2;
    const size = Number.isInteger(tabSize) && tabSize > 0 ? tabSize : 2;
    return lines.map(line => line.replace(/^[\t ]+/, indent => {
        const width = indent.replaceAll('\t', '  ').length;
        const levels = Math.floor(width / base);
        return (insertSpaces ? ' '.repeat(levels * size) : '\t'.repeat(levels)) + ' '.repeat(width % base);
    })).join(eol);
}

/** Await parent creation and use exclusive writes so an existing or concurrently created file is never overwritten. */
export async function writeNewFile (path: string, content: string): Promise<boolean> {
    await mkdir(dirname(path), { recursive: true });
    try { await writeFile(path, content, { encoding: 'utf8', flag: 'wx' }); return true; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'EEXIST') { return false; } throw error; }
}

/** Generate a Pinia options store with the identifier passed as defineStore's first argument. */
export function piniaOptionsTemplate (name: string): string {
    const id = normalizedIdentifier(name);
    return `/** ${id} store state and actions. */\nimport { defineStore } from 'pinia'\n\n/** Access this store through Nuxt auto-imports or an explicit import. */\nexport const use${id}Store = defineStore('${id}Store', {\n  /** Create independent state for each Pinia instance. */\n  state: () => ({}),\n  actions: {}\n})\n`;
}

/** Nitro request middleware observes or augments context while leaving the response to the route handler. */
export const serverMiddlewareTemplate = '/** Inspect or augment the incoming request context before route handling. */\nexport default defineEventHandler((event) => {\n  // Add request-scoped values to event.context as needed.\n})\n';
