const templateTag = (type: string, language: string) => {
    if (language === 'html') {
        return `<template>
  <div>
    ${type === 'layout' ? '<slot />' : ''}
  </div>
</template>\n
`
    } else {
        return `<template>
  div
    ${type === 'layout' ? 'slot' : ''}
</template>\n
`
    }
}

function generateStyleTag(lang: string, scoped: boolean) {
    return `
<style${lang === 'css' ? '' : ` lang="${lang}"`}${scoped ? ' scoped' : ''}>

</style>\n
`
}

function generateScriptTag(scriptType: string, lang: string) {
    return `<script${lang === 'ts' ? ' lang="ts"' : ''}${scriptType === 'setup' ? ' setup' : ''}>

</script>\n`
}

export { generateStyleTag, generateScriptTag, templateTag }
