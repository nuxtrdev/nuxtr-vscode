/** Generate project-aware Vue and Pinia scaffolds, honoring configured custom templates. */
import { join } from 'node:path';
import { TemplateKind } from '../core/templates';
import { projectResourceName } from '../core/messages';
import { readFileSync } from 'node:fs';
import { nuxtrConfiguration, projectRootDirectory } from '.';
import { composableTemplate, generateScriptTag, generateStyleTag, nitroDefaultTemplate, piniaOptionsContent, piniaSetupContent, templateTag } from '../templates';


/** Read a selected project template or use the configured default scaffold. */
export function generateVueFileTemplate (type: 'page' | 'layout' | 'component', template?: string) {
    const userDefaultTemplate = template || (type === 'page'
        ? nuxtrConfiguration().vueFiles.pages.defaultTemplate
        : (type === 'layout' ? nuxtrConfiguration().vueFiles.layouts.defaultTemplate : nuxtrConfiguration().fileTemplates.components.defaultTemplate));
    if (userDefaultTemplate && !projectResourceName(userDefaultTemplate)) { throw new Error('Select a template filename inside .vscode.'); }

    const templatePath = `${projectRootDirectory()}/.vscode/${userDefaultTemplate}`;
    try {
        return readFileSync(templatePath).toString();
    } catch {
        return generateVueFileBasicTemplate(type);
    }
}

/** Combine Vue tags in the configured order and languages. */
export function generateVueFileBasicTemplate (type: string) {
    let fileTemplate = ''
    const templateLang = nuxtrConfiguration().vueFiles.template.defaultLanguage
    const firstTag = nuxtrConfiguration().vueFiles.firstTag
    const scriptType = nuxtrConfiguration().vueFiles.script.type
    const addStyleTag = nuxtrConfiguration().vueFiles.style.addStyleTag
    const styleLang = nuxtrConfiguration().vueFiles.style.defaultLanguage
    const isScoped = nuxtrConfiguration().vueFiles.style.alwaysScoped
    const lang = nuxtrConfiguration().vueFiles.script.defaultLanguage

    const scriptTag = generateScriptTag(scriptType, lang)

    const eol = '\n\n';

    if (firstTag === 'template') {
        fileTemplate = templateTag(type, templateLang);
        fileTemplate += eol;
        fileTemplate += scriptTag;
    } else {
        fileTemplate = scriptTag;
        fileTemplate += eol;
        fileTemplate += templateTag(type, templateLang);
    }

    if (addStyleTag) {
        fileTemplate += eol;
        fileTemplate += generateStyleTag(styleLang, isScoped);
    }

    return fileTemplate
}

/** Select the configured Pinia setup/options starter. */
export function generatePiniaTemplates (name: string) {
    return nuxtrConfiguration().piniaFiles.defaultTemplate === 'options' ? piniaOptionsContent(name) : piniaSetupContent(name)
}
/** Select a project template for components, composables or APIs, retaining built-in defaults. */
export function generateScaffoldTemplate (type: TemplateKind, name = 'Example', template?: string): string {
    if (type === 'page' || type === 'layout' || type === 'component') { return generateVueFileTemplate(type, template); }
    const settings = nuxtrConfiguration().fileTemplates;
    const filename = template || (type === 'composable' ? settings.composables.defaultTemplate : settings.apis.defaultTemplate);
    if (filename) {
        if (!projectResourceName(filename)) { throw new Error('Select a template filename inside .vscode.'); }
        try { return readFileSync(join(projectRootDirectory(), '.vscode', filename), 'utf8'); }
        catch { /* A removed optional default falls back to the built-in template. */ }
    }
    return type === 'composable' ? composableTemplate(name) : nitroDefaultTemplate;
}
/** Return the default language used by application and server code generators. */
export function scaffoldExtension (): '.ts' | '.js' { return '.' + nuxtrConfiguration().scaffolding.defaultLanguage as '.ts' | '.js'; }
