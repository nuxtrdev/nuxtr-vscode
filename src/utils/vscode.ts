import { DocumentSelector } from 'vscode';

export const languageSelector = (language: string): DocumentSelector => ({
    scheme: 'file',
    language,
} as const);

export const patternSelector = (pattern: string): DocumentSelector => ({
    scheme: 'file',
    pattern,
} as const);