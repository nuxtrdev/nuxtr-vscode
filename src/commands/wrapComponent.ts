/** Wrap selected Vue template content with a Nuxt built-in component using one undoable editor edit. */
import { EndOfLine, window } from 'vscode';
import { WrappingComponent, templateSelection, wrapSelection, wrappingComponents } from '../core/wrap';

/** Pick a supported component and wrap every selection, rejecting stale documents and unsupported Vue regions. */
export async function wrapWithNuxtComponent (component?: unknown): Promise<boolean> {
    const editor = window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'vue') { throw new Error('Open a Vue file and select HTML template content first.'); }
    const document = editor.document;
    const version = document.version;
    const selections = [...editor.selections];
    const source = document.getText();
    if (selections.some(selection => !templateSelection(source, document.offsetAt(selection.start), document.offsetAt(selection.end)))) {
        throw new Error('Select content inside an inline HTML Vue template. Script, style and Pug blocks cannot be wrapped.');
    }
    // Editor context menus supply a resource URI; only an explicit component name bypasses the picker.
    const requested = typeof component === 'string' ? component : undefined;
    const selected = requested || (await window.showQuickPick(wrappingComponents.map(item => ({ label: item.name, description: item.description })), { placeHolder: 'Wrap selection with a Nuxt component' }))?.label;
    if (!selected) { return false; }
    if (window.activeTextEditor !== editor || document.version !== version || editor.selections.length !== selections.length || editor.selections.some((selection, index) => !selection.isEqual(selections[index]))) {
        throw new Error('The document or selection changed while choosing a component. Select the content and try again.');
    }
    const indent = editor.options.insertSpaces === false ? '\t' : ' '.repeat(typeof editor.options.tabSize === 'number' ? editor.options.tabSize : 4);
    const eol = document.eol === EndOfLine.CRLF ? '\r\n' : '\n';
    const edits = selections.map(selection => ({ selection, text: wrapSelection(source, document.offsetAt(selection.start), document.offsetAt(selection.end), selected as WrappingComponent, indent, eol) }));
    return editor.edit(builder => { for (const edit of edits) { builder.replace(edit.selection, edit.text); } }, { undoStopBefore: true, undoStopAfter: true });
}
