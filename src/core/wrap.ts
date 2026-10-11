/** Locate HTML Vue template selections and wrap content without changing its relative indentation or literal characters. */
export const wrappingComponents = [
    { name: 'ClientOnly', description: 'Render the selection only in the browser' },
    { name: 'NuxtLink', description: 'Wrap a navigation link; edit its to attribute afterward' },
    { name: 'DevOnly', description: 'Render the selection only during development' },
    { name: 'NuxtLayout', description: 'Render the selection inside the default layout' },
    { name: 'NuxtErrorBoundary', description: 'Catch client-side rendering errors in the selection' },
] as const;
export type WrappingComponent = typeof wrappingComponents[number]['name'];

/** Find an inline HTML template block, ignoring comments, script/style raw text and nested template slots. */
export function templateSelection (source: string, start: number, end: number): boolean {
    if (start < 0 || end <= start || end > source.length) { return false; }
    const tokens = /<!--[\s\S]*?-->|<\/?([\w:-]+)(?:[^>"']|"[^"]*"|'[^']*')*>/g;
    let depth = 0;
    let contentStart = -1;
    let valid = false;
    for (let token = tokens.exec(source); token; token = tokens.exec(source)) {
        const name = token[1]?.toLowerCase();
        if (!name) { continue; }
        const closing = token[0].startsWith('</');
        if (depth === 0 && !closing && ['script', 'style'].includes(name)) {
            const close = new RegExp(`</${name}\\s*>`, 'gi');
            close.lastIndex = tokens.lastIndex;
            const match = close.exec(source);
            if (!match) { return false; }
            tokens.lastIndex = close.lastIndex;
            continue;
        }
        if (name !== 'template') { continue; }
        if (!closing) {
            if (depth === 0) {
                contentStart = tokens.lastIndex;
                valid = !/\bsrc\s*=/.test(token[0]) && (!/\blang\s*=/.test(token[0]) || /\blang\s*=\s*(["'])html\1/.test(token[0]));
            }
            if (!token[0].endsWith('/>')) { depth++; }
        } else if (depth > 0 && --depth === 0 && valid && start >= contentStart && end <= token.index) { return true; }
    }
    return false;
}

/** Produce a literal edit, preserving inline content, tabs/spaces, line endings, blank lines and snippet-like text. */
export function wrapSelection (source: string, start: number, end: number, component: WrappingComponent, indent: string, eol: string): string {
    if (!wrappingComponents.some(item => item.name === component)) { throw new Error('Choose a supported Nuxt component.'); }
    if (!templateSelection(source, start, end)) { throw new Error('Select content inside an inline HTML Vue template. Script, style and Pug blocks cannot be wrapped.'); }
    const selected = source.slice(start, end);
    const opening = `<${component}${component === 'NuxtLink' ? ' to="/"' : ''}>`;
    const closing = `</${component}>`;
    if (!/[\r\n]/.test(selected)) { return opening + selected + closing; }
    const prefix = source.slice(source.lastIndexOf('\n', start - 1) + 1, start);
    const externalIndent = /^[\t ]*/.exec(prefix)![0];
    const lines = selected.split(/\r?\n/);
    const trailingNewline = lines.at(-1) === '';
    if (trailingNewline) { lines.pop(); }
    const base = prefix.length === 0 ? (/^[\t ]*/.exec(lines.find(line => line.trim()) || '')![0]) : externalIndent;
    const body = lines.map((line, index) => {
        const content = index === 0 && prefix.length > 0 ? line : (line.startsWith(base) ? line.slice(base.length) : line);
        return content.length > 0 ? base + indent + content : '';
    }).join(eol);
    return (prefix.length === 0 ? base : '') + opening + eol + body + eol + base + closing + (trailingNewline ? eol : '');
}
