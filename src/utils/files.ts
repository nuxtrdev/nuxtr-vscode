import { readFileSync } from 'node:fs'
import { nuxtrConfiguration, projectRootDirectory, vscodeConfiguration } from '.';
import { generateScriptTag, generateStyleTag, piniaOptionsContent, piniaSetupContent, templateTag } from '../templates'

const vueFilesConfig = nuxtrConfiguration().vueFiles
const piniaConfig = nuxtrConfiguration().piniaFiles.defaultTemplate
const eolConfiguration = vscodeConfiguration().files.eol

export function generateVueFileTemplate(type: 'page' | 'layout', template?: string) {
    const userDefaultTemplate = template || (type === 'page'
        ? vueFilesConfig.pages.defaultTemplate
        : vueFilesConfig.layouts.defaultTemplate);

    const templatePath = `${projectRootDirectory()}/.vscode/${userDefaultTemplate}`;
    try {
        return readFileSync(templatePath).toString();
    } catch {
        return generateVueFileBasicTemplate(type);
    }
}

export function generateVueFileBasicTemplate(type: string) {
    let fileTemplate = ``
    const templateLang = vueFilesConfig.template.defaultLanguage
    const firstTag = vueFilesConfig.firstTag
    const scriptType = vueFilesConfig.script.type
    const addStyleTag = vueFilesConfig.style.addStyleTag
    const styleLang = vueFilesConfig.style.defaultLanguage
    const isScoped = vueFilesConfig.style.alwaysScoped
    const lang = vueFilesConfig.script.defaultLanguage

    const scriptTag = generateScriptTag(scriptType, lang)

    const eol = eolConfiguration === '\n' ? `\n\n` : `\n\n`;

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

    // eolConfiguration !== '\n' ? normalizeLFToCRLF(fileTemplate) :
    return fileTemplate
}

export function generatePiniaTemplates(name: string) {
    return piniaConfig === 'options' ? piniaOptionsContent(name) : piniaSetupContent(name)
}