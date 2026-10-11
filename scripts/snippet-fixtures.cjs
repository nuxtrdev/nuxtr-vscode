/** Expand shipped snippet defaults into isolated Nuxt fixtures so real framework types verify their signatures. */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

/** Expand simple VS Code tab stops, remembering defaults for repeated placeholders and literal dollar signs. */
function expandSnippet (body) {
    const defaults = new Map();
    const source = Array.isArray(body) ? body.join('\n') : body;
    return source.replace(/\$\{(\d+):([^{}]*)\}/g, (_, index, value) => {
        defaults.set(index, value);
        return value;
    }).replace(/(?<!\\)\$(\d+)|\$\{(\d+)\}/g, (_, simple, braced) => defaults.get(simple || braced) || '').replace(/\\\$/g, '$');
}

/** Typecheck every H3 default in an async event handler without making network calls or executing session/proxy examples. */
function h3Fixture () {
    const snippets = JSON.parse(readFileSync(join(__dirname, '../snippets/nitro/h3.json'), 'utf8'));
    return '/** Generated H3 signature checks; examples are compiled but never executed. */\nexport default defineEventHandler(async (event) => {\n' +
        '    const examples = [\n' + Object.entries(snippets).map(([name, snippet]) =>
            '        // ' + name + '\n        async () => {\n' + expandSnippet(snippet.body).split('\n').map(line => '            ' + line).join('\n') + '\n        }'
        ).join(',\n') + '\n    ];\n    return { examples: examples.length };\n});\n';
}

/** Compile documented Nuxt APIs in their supported SFC, plugin, middleware or composable contexts. */
function nuxtFixtures (major) {
    const files = new Map();
    const components = JSON.parse(readFileSync(join(__dirname, '../snippets/nuxt/components.json'), 'utf8'));
    const tags = Object.values(components).filter(snippet => snippet.documentation && !(major === 3 && snippet.minimumNuxtVersion?.startsWith('4.'))).map(snippet => expandSnippet(snippet.body));
    files.set('components/NuxtrApiComponents.vue', '<!-- Generated checks for every documented component. -->\n<template>\n<div>\n' + tags.join('\n') + '\n</div>\n</template>\n');
    for (const group of ['composables', 'utils']) {
        const snippets = JSON.parse(readFileSync(join(__dirname, '../snippets/nuxt/' + group + '.json'), 'utf8'));
        for (const [name, snippet] of Object.entries(snippets)) {
            if (!snippet.documentation || (major === 3 && snippet.minimumNuxtVersion?.startsWith('4.'))) { continue; }
            const body = expandSnippet(snippet.body);
            const header = '/** Generated ' + name + ' snippet signature check. */\n';
            if (name.startsWith('createUse')) { files.set('composables/' + name + 'Check.ts', header + body); }
            else if (name === 'defineNuxtPlugin' || name === 'definePayloadPlugin') { files.set('plugins/' + name + '-snippet-check.ts', header + body); }
            else if (name === 'defineNuxtRouteMiddleware') { files.set('middleware/snippet-check.ts', header + body); }
            else {
                const ordinary = name === 'defineNuxtComponent';
                const macro = ['definePageMeta', 'defineRouteRules', 'defineLazyHydrationComponent'].includes(name);
                const source = ordinary || macro ? body : 'async function checkSnippet () {\n' + body + '\n}\n';
                const directory = ['definePageMeta', 'defineRouteRules'].includes(name) ? 'pages' : 'components';
                files.set(directory + '/Snippet' + name.replace('$', 'Dollar') + '.vue', '<!-- Generated ' + name + ' signature check. -->\n<script ' + (ordinary ? '' : 'setup ') + 'lang="ts">\n' + source + '\n</script>\n<template><div /></template>\n');
            }
        }
    }
    files.set('components/Example.vue', '<!-- Lazy hydration target. -->\n<template><div>Example</div></template>\n');
    files.set('components/Example.server.vue', '<!-- Server island target. -->\n<template><div>Example island</div></template>\n');
    files.set('layouts/default.vue', '<!-- Default layout for API checks. -->\n<template><slot /></template>\n');
    return files;
}

module.exports = { expandSnippet, h3Fixture, nuxtFixtures };
