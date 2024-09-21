const templateTag = (type: string, language: string) => {
    return language === 'html' ? `<template>
  <div>
    ${type === 'layout' ? '<slot />' : ''}
  </div>
</template>` : `<template lang="pug">
  div
    ${type === 'layout' ? 'slot' : ''}
</template>`;
}

function generateStyleTag (lang: string, scoped: boolean) {
    return `<style${lang === 'css' ? '' : ` lang="${lang}"`}${scoped ? ' scoped' : ''}>

</style>`
}

function generateScriptTag (scriptType: string, lang: string) {
    return `<script${lang === 'ts' ? ' lang="ts"' : ''}${scriptType === 'setup' ? ' setup' : ''}>

</script>`
}

export { generateStyleTag, generateScriptTag, templateTag }
