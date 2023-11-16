import { readFileSync } from 'fs'
import { getConfiguration, projectRootDirectory, projectSrcDirectory } from '.'
import { generateStyleTag, generateScriptTag, templateTag, piniaOptionsContent, piniaSetupContent } from '../templates'

let vueFilesConfig = getConfiguration().vueFiles
let piniaConfig = getConfiguration().piniaFiles.defaultTemplate

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

    if (firstTag === 'template') {
        fileTemplate = templateTag(type, templateLang);
        fileTemplate += scriptTag;
    } else {
        fileTemplate = scriptTag;
        fileTemplate += templateTag(type, templateLang);
    }

    if (addStyleTag) { fileTemplate += generateStyleTag(styleLang, isScoped); }

    return fileTemplate
}

export function generatePiniaTemplates(name: string) {
    return piniaConfig === 'options' ? piniaOptionsContent(name) : piniaSetupContent(name)
}