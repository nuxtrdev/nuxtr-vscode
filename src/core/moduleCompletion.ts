/** Identify static Nuxt module-array insertion positions and select safe, compatible cached package names. */
import { valid } from 'semver';
import { CatalogueModule, moduleCompatible } from './catalogue';
import { configModule } from './modules';

export interface ModuleCompletionContext { start: number; end: number; prefix: string; quoted: boolean; configured: string[]; }

/** Remove comments only from array gaps; comment text itself must never become an insertion target. */
function arrayGap (source: string): string { return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, ''); }

/** Find literals or blank first tuple entries, excluding options, unrelated properties and computed modules. */
export function moduleCompletionContext (source: string, cursor: number): ModuleCompletionContext | undefined {
    if (cursor < 0 || cursor > source.length || source.length > 250_000) { return; }
    let ast: any;
    let repaired = false;
    try { ast = configModule(source).config.$ast; }
    catch {
        // Closing an unfinished package string is safe: the resulting complete config still must parse as a literal object.
        const unfinished = /(["'])([^"'\\\r\n]*)$/.exec(source.slice(0, cursor));
        if (!unfinished) { return; }
        try { ast = configModule(source.slice(0, cursor) + unfinished[1] + source.slice(cursor)).config.$ast; repaired = true; }
        catch { return; }
    }
    const property = ast.properties.find((value: any) => !value.computed && (value.key?.name || value.key?.value) === 'modules');
    const array = property?.value;
    if (array?.type !== 'ArrayExpression') { return; }
    const entries: any[] = array.elements || [];
    const configured = entries.map(entry => entry?.type === 'ArrayExpression' ? entry.elements?.[0] : entry).filter(entry => entry?.type === 'StringLiteral');
    for (const entry of configured) {
        const end = repaired && entry.end === cursor + 1 ? cursor : entry.end - 1;
        if (cursor >= entry.start + 1 && cursor <= end) {
            const prefix = source.slice(entry.start + 1, cursor);
            if (!/^[\w@./~-]*$/.test(prefix)) { return; }
            return { start: entry.start + 1, end, prefix, quoted: true, configured: configured.filter(value => value !== entry).map(value => value.value) };
        }
    }
    if (repaired) { return; }
    const target = entries.find(entry => entry?.type === 'ArrayExpression' && cursor > entry.start && cursor < entry.end) || array;
    const values: any[] = target.elements || [];
    if (cursor <= target.start || cursor >= target.end || values.some(entry => entry && cursor >= entry.start && cursor <= entry.end)) { return; }
    let previous: any;
    for (const entry of values) { if (entry && entry.end < cursor) { previous = entry; } }
    // A tuple contains exactly one module-name position; strings in its options are never module names.
    if (target !== array && previous) { return; }
    const gap = source.slice(previous?.end || target.start + 1, cursor);
    const withoutBlockComments = gap.replace(/\/\*[\s\S]*?\*\//g, '');
    if (withoutBlockComments.includes('/*') || /\/\/[^\r\n]*$/.test(withoutBlockComments)) { return; }
    const clean = arrayGap(gap);
    if (!(previous ? /^\s*,\s*$/.test(clean) : /^\s*$/.test(clean))) { return; }
    return { start: cursor, end: cursor, prefix: '', quoted: false, configured: configured.map(entry => entry.value) };
}

/** Suggest canonical module names once, omitting configured packages, layers and known incompatible Nuxt ranges. */
export function moduleCompletionCandidates (modules: CatalogueModule[], context: ModuleCompletionContext, version?: string): CatalogueModule[] {
    const included = new Set(context.configured);
    const seen = new Set<string>();
    const knownVersion = version && valid(version) ? version : undefined;
    return modules.filter(module => {
        if (module.isLayer || seen.has(module.npm) || included.has(module.npm) || !module.npm.toLowerCase().startsWith(context.prefix.toLowerCase())) { return false; }
        seen.add(module.npm);
        return !knownVersion || !module.compatibility.nuxt || moduleCompatible(module, knownVersion);
    }).sort((a, b) => (a.type === 'official' ? 0 : 1) - (b.type === 'official' ? 0 : 1) || a.npm.localeCompare(b.npm));
}
