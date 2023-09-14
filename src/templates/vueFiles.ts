const templateTag = (type: string, language: string) => {
    if (language === 'html') {
        return `<template>
  <div>
    ${type === 'layout' ? '<slot />' : ''}
  </div>
</template>\n\n`
    } else {
        return `<template>
  div
    ${type === 'layout' ? 'slot' : ''}
</template>\n\n`
    }
}

function generateStyleTag(lang: string, scoped: boolean) {
    return `
<style${lang === 'css' ? '' : ` lang="${lang}"`}${scoped ? ' scoped' : ''}>

</style>
`
}

function generateScriptTag(scriptType: string, lang: string) {
    return `<script${lang === 'ts' ? ' lang="ts"' : ''}${scriptType === 'setup' ? ' setup' : ''}>

</script>\n\n
`
}

export { generateStyleTag, generateScriptTag, templateTag }
