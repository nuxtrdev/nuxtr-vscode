const templateTag = (type: string) => `<template>
  <div>
    ${type === 'layout' ? '<slot />' : ''}
  </div>
</template>\n\n`

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
