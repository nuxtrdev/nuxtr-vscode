import { readFileSync } from 'fs'
import { nuxtrConfiguration, projectRootDirectory, vscodeConfiguration } from '.';
import { generateStyleTag, generateScriptTag, templateTag, piniaOptionsContent, piniaSetupContent } from '../templates'

let vueFilesConfig = nuxtrConfiguration().vueFiles
let piniaConfig = nuxtrConfiguration().piniaFiles.defaultTemplate
let eolConfiguration = vscodeConfiguration().files.eol
let eol = eolConfiguration === 'auto' ? '\n' : eolConfiguration

export function generateVueFileTemplate(type: string, template?: string) {
    const userDefaultTemplate = template || (type === 'page'
        ? vueFilesConfig.pages.defaultTemplate
        : vueFilesConfig.layouts.defaultTemplate);

    const templatePath = `${projectRootDirectory()}/.vscode/${userDefaultTemplate}`;
    try {
        return readFileSync(templatePath).toString();
    } catch (error) {
        return generateVueFileBasicTemplate(type);
    }
}

export function normalizeLFToCRLF(text: string) {
    return text.replace(/\n/g, '\r\n');
}

export function generateVueFileBasicTemplate(type: string) {
    let fileTemplate = ``
    let templateLang = vueFilesConfig.template.defaultLanguage
    let firstTag = vueFilesConfig.firstTag
    let scriptType = vueFilesConfig.script.type
    let addStyleTag = vueFilesConfig.style.addStyleTag
    let styleLang = vueFilesConfig.style.defaultLanguage
    let isScoped = vueFilesConfig.style.alwaysScoped
    let lang = vueFilesConfig.script.defaultLanguage

    let scriptTag = generateScriptTag(scriptType, lang)

    let eol = eolConfiguration === '\n' ? `\n\n` : `\n\n`;

    if (firstTag === 'template') {
        fileTemplate = templateTag(type, templateLang);
        fileTemplate += eol;
        fileTemplate += scriptTag;
        fileTemplate += eol;
    } else {
        fileTemplate = scriptTag;
        fileTemplate += eol;
        fileTemplate += templateTag(type, templateLang);
        fileTemplate += eol;
    }

    if (addStyleTag) { fileTemplate += generateStyleTag(styleLang, isScoped); }

    // eolConfiguration !== '\n' ? normalizeLFToCRLF(fileTemplate) :
    return fileTemplate
}

export function generatePiniaTemplates(name: string) {
    return piniaConfig === 'options' ? piniaOptionsContent(name) : piniaSetupContent(name)
}