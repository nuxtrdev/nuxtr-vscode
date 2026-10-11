/** Describe supported template kinds and normalize scaffold filenames independently of VS Code. */
import { normalizedExtension, normalizedIdentifier } from './generated';
export type TemplateKind = 'page' | 'layout' | 'component' | 'composable' | 'api';
export type ScaffoldLanguage = 'ts' | 'js';

/** Avoid doubling an existing use prefix while preserving names such as useful. */
export function composableName (name: string): string {
    const base = normalizedExtension(name, '.ts').split(/[\\/]/).pop()!;
    return normalizedIdentifier(base.replace(/^use(?=[A-Z_-])/, ''));
}

/** Normalize one output suffix and optionally prefix only the composable's final path segment. */
export function scaffoldFileName (name: string, kind: TemplateKind, language: ScaffoldLanguage = 'ts', usePrefix = false): string {
    const extension = ['page', 'layout', 'component'].includes(kind) ? '.vue' : '.' + language;
    const base = normalizedExtension(name, extension);
    if (kind !== 'composable' || !usePrefix) { return base + extension; }
    const parts = base.split(/[\\/]/);
    const leaf = parts.pop()!;
    return [...parts, 'use' + composableName(leaf)].join('/') + extension;
}

/** Identify template resources by their final, supported suffix. */
export function templateKind (filename: string): TemplateKind | undefined {
    return /\.(page|layout|component|composable|api)-template$/.exec(filename)?.[1] as TemplateKind | undefined;
}
