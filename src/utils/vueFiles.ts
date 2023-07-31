import * as fs from 'fs'
import { getConfiguration, projectSrcDirectory } from '../utils'
import { generateStyleTag, generateScriptTag, templateTag, } from '../templates/vueFiles'

let configuration = getConfiguration()

export function generateVueFileTemplate(type: string, template?: string) {
    const userDefaultTemplate = template || (type === 'page'
        ? configuration.vueFiles.pages.defaultTemplate
        : configuration.vueFiles.layouts.defaultTemplate);

    const templatePath = `${projectSrcDirectory()}/.vscode/${userDefaultTemplate}`;
    try {
        return fs.readFileSync(templatePath).toString();
    } catch (error) {
        return generateVueFileBasicTemplate(type);
    }
}




export function generateVueFileBasicTemplate(type: string) {
    let fileTemplate = ``
    let firstTag = configuration.vueFiles.firstTag
    let scriptType = configuration.vueFiles.script.type
    let addStyleTag = configuration.vueFiles.style.addStyleTag
    let styleLang = configuration.vueFiles.style.defaultLanguage
    let isScoped = configuration.vueFiles.style.alwaysScoped
    let lang = configuration.vueFiles.script.defaultLanguage

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