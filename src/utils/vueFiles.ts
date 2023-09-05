import * as fs from 'fs'
import { getConfiguration, projectSrcDirectory } from '../utils'
import { generateStyleTag, generateScriptTag, templateTag, } from '../templates/vueFiles'

let vueFilesConfig = getConfiguration().vueFiles

export function generateVueFileTemplate(type: string, template?: string) {
    const userDefaultTemplate = template || (type === 'page'
        ? vueFilesConfig.pages.defaultTemplate
        : vueFilesConfig.layouts.defaultTemplate);

    const templatePath = `${projectSrcDirectory()}/.vscode/${userDefaultTemplate}`;
    try {
        return fs.readFileSync(templatePath).toString();
    } catch (error) {
        return generateVueFileBasicTemplate(type);
    }
}

export function generateVueFileBasicTemplate(type: string) {
    let fileTemplate = ``
    let firstTag = vueFilesConfig.firstTag
    let scriptType = vueFilesConfig.script.type
    let addStyleTag = vueFilesConfig.style.addStyleTag
    let styleLang = vueFilesConfig.style.defaultLanguage
    let isScoped = vueFilesConfig.style.alwaysScoped
    let lang = vueFilesConfig.script.defaultLanguage

    let scriptTag = generateScriptTag(scriptType, lang)

    if (firstTag === 'template') {
        fileTemplate = templateTag(type);
        fileTemplate += scriptTag;
    } else {
        fileTemplate = scriptTag;
        fileTemplate += templateTag(type);
    }

    if (addStyleTag) { fileTemplate += generateStyleTag(styleLang, isScoped); }

    return fileTemplate
}