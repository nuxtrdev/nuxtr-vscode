/** Save reusable project templates and instantiate them through the shared directory and filename resolvers. */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { window } from 'vscode';
import { TemplateKind, scaffoldFileName, templateKind } from '../core/templates';
import { projectResourceName } from '../core/messages';
import { projectDirectory } from '../utils/nuxt';
import { createDir, createFile, createSubFolders, createVueTemplate, generateScaffoldTemplate, nuxtrConfiguration, projectRootDirectory, showSubFolderQuickPick } from '../utils';

/** Save the editor selection, or whole document, as a named page template. */
function createPageTemplate () { return saveEditorTemplate('page'); }
/** Save the editor selection, or whole document, as a named layout template. */
function createLayoutTemplate () { return saveEditorTemplate('layout'); }
/** Read editor content once and preserve the existing page/layout template workflow. */
function saveEditorTemplate (type: 'page' | 'layout') {
    const editor = window.activeTextEditor;
    if (editor) { return createVueTemplate(editor.document.getText(editor.selection) || editor.document.getText(), type); }
}

/** Select a supported .vscode resource and create its file in the selected project's configured directory. */
async function createFileFromTemplate (template?: string) {
    if (!template) {
        const directory = join(projectRootDirectory(), '.vscode');
        const resources = existsSync(directory) ? readdirSync(directory).filter(name => templateKind(name)) : [];
        template = await window.showQuickPick(resources, { placeHolder: 'Select a project file template' });
    }
    if (!template) { return; }
    const kind = templateKind(template);
    if (!kind || !projectResourceName(template)) { throw new Error('Select a supported template filename from this project’s .vscode directory.'); }
    const name = await window.showInputBox({ prompt: `What is your ${kind} name?`, placeHolder: `${kind} name` });
    if (!name) { return; }
    const commandType = { page: 'pages', layout: 'layouts', component: 'components', composable: 'composables', api: 'api' }[kind];
    const directory = kind === 'api' ? join(projectDirectory('server'), 'api') : projectDirectory(commandType as 'pages');
    await createDir(directory);
    const settings = nuxtrConfiguration().scaffolding;
    return showSubFolderQuickPick({
        name: scaffoldFileName(name, kind, settings.defaultLanguage, settings.composableUsePrefix),
        subFolders: await createSubFolders(directory, commandType), commandType,
        content: generateScaffoldTemplate(kind, name, template)
    });
}

/** Create a new template resource with the same defaults used by its scaffold kind. */
async function createFileTemplate (type: TemplateKind) {
    const name = await window.showInputBox({ prompt: `What is your ${type} template name?`, placeHolder: 'Template name' });
    if (!name) { return; }
    const filename = name.replace(/\.(?:page|layout|component|composable|api)-template$/, '') + `.${type}-template`;
    if (!projectResourceName(filename)) { throw new Error('Enter a template basename without directory separators.'); }
    return createFile({ fileName: filename, content: generateScaffoldTemplate(type), fullPath: join(projectRootDirectory(), '.vscode', filename) });
}

/** Offer every supported template kind while retaining the page/layout choices. */
async function createEmptyFileTemplate () {
    const kind = await window.showQuickPick(['page', 'layout', 'component', 'composable', 'api'], { placeHolder: 'Select a template kind' });
    if (kind) { return createFileTemplate(kind as TemplateKind); }
}
export { createEmptyFileTemplate, createFileFromTemplate, createLayoutTemplate, createPageTemplate };
