/** Build and typecheck generated recipes in isolated, pinned Nuxt 3/4 projects without application APIs. */
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createJiti } from 'jiti';
import { parseDocument } from 'yaml';
import snippetFixtures from './snippet-fixtures.cjs';
const jiti = createJiti(import.meta.url);
const { configureTailwindSource, tailwindRecipe } = await jiti.import('../src/core/tailwind.ts');
const { formatGeneratedContent, piniaOptionsTemplate, serverMiddlewareTemplate } = await jiti.import('../src/core/generated.ts');
const { piniaSetupContent } = await jiti.import('../src/templates/stores.ts');
const { nitroDefaultTemplate, composableTemplate } = await jiti.import('../src/templates/typeScriptFiles.ts');
const { installedNitroMajor, nitroTaskTemplate, enableTasksSource } = await jiti.import('../src/core/tasks.ts');
const { scaffoldFileName } = await jiti.import('../src/core/templates.ts');
const { executeCommand, requireSuccess } = await jiti.import('../src/core/process.ts');

/** Run a fixture check with complete diagnostics and a bounded installation/build timeout. */
async function check (root, args) {
    console.log('FIXTURE CHECK: ' + args.join(' '));
    const result = await executeCommand({ executable: 'pnpm', args, cwd: root, timeoutMs: 180_000 });
    if (!result.success) { console.error(result.stdout); console.error(result.stderr); }
    requireSuccess(result);
}

/** Retain fixture policies and permit only the exact freshly selected Nuxt/Vue tooling releases. */
async function fixtureSettings (root) {
    const file = join(root, 'pnpm-workspace.yaml');
    const source = await readFile(file, 'utf8').catch(() => '');
    const settings = parseDocument(source);
    settings.setIn(['allowBuilds', 'esbuild'], true);
    const selected = ['vue-tsc@3.3.13', '@vue/language-core@3.3.13', ...['nuxt', '@nuxt/kit', '@nuxt/schema', '@nuxt/nitro-server', '@nuxt/vite-builder', '@nuxt/vite-server'].map(name => name + '@4.6.1')];
    const previous = settings.get('minimumReleaseAgeExclude')?.toJSON() || [];
    settings.set('minimumReleaseAgeExclude', [...new Set([...previous, ...selected])]);
    await writeFile(file, settings.toString());
}

/** Generate a representative application, then freeze installed dependencies before Nuxt preparation/types/build. */
async function fixture (major, recipe) {
    const root = process.env['NUXTR_FIXTURE_' + major] || await mkdtemp(join(tmpdir(), `nuxtr-nuxt${major}-${recipe}-`));
    console.log('FIXTURE: ' + root);
    const definition = tailwindRecipe(recipe);
    const app = major === 4 ? join(root, 'app') : root;
    await mkdir(join(app, 'assets/css'), { recursive: true });
    await mkdir(join(app, 'pages'), { recursive: true });
    const dependencies = { nuxt: major === 4 ? '4.6.1' : '3.21.11', typescript: '6.0.3', 'vue-tsc': '3.3.13', pinia: '4.0.3', '@nuxt/image': '2.1.0' };
    for (const packageSpec of definition.packages) {
        const index = packageSpec.lastIndexOf('@');
        dependencies[packageSpec.slice(0, index)] = packageSpec.slice(index + 1);
    }
    await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'nuxtr-fixture', private: true, type: 'module', packageManager: 'pnpm@12.10.1', devDependencies: dependencies }, null, 2));
    await writeFile(join(root, 'tsconfig.json'), JSON.stringify(major === 3 ? { extends: './.nuxt/tsconfig.json' } : { files: [], references: ['app', 'server', 'shared', 'node'].map(context => ({ path: './.nuxt/tsconfig.' + context + '.json' })) }, null, 2));
    await fixtureSettings(root);
    await writeFile(join(root, 'nuxt.config.ts'), configureTailwindSource('/** Generated fixture configuration. */\nexport default defineNuxtConfig({ modules: ["@nuxt/image"], experimental: { componentIslands: true, clientFallback: true, inlineRouteRules: true }, devtools: { enabled: false }, runtimeConfig: { sessionPassword: "fixture-only-secret-must-never-be-used-in-production" }, compatibilityDate: "2026-10-01" })\n', recipe, '~/assets/css/tailwind.css'));
    await writeFile(join(app, 'assets/css/tailwind.css'), definition.css);
    await writeFile(join(app, 'app.vue'), '<!-- Generated fixture application shell. -->\n<template><NuxtPage /></template>\n');
    await writeFile(join(app, 'pages/index.vue'), '<!-- Generated fixture page verifies CSS compilation. -->\n<template><h1 class="text-3xl font-bold">Nuxtr fixture</h1></template>\n');
    for (const directory of ['stores', 'composables']) { await mkdir(join(app, directory), { recursive: true }); }
    await mkdir(join(root, 'server/api'), { recursive: true });
    await mkdir(join(root, 'server/middleware'), { recursive: true });
    for (const [path, content] of [
        [join(app, 'stores/options.ts'), piniaOptionsTemplate('smokeOptions')],
        [join(app, 'stores/setup.ts'), piniaSetupContent('smokeSetup')],
        [join(app, 'composables/useSmoke.ts'), composableTemplate('smoke')],
        [join(root, 'server/api/hello.ts'), nitroDefaultTemplate],
        [join(root, 'server/api/h3-snippet-check.ts'), snippetFixtures.h3Fixture()],
        [join(root, 'server/middleware/context.ts'), serverMiddlewareTemplate],
        [join(app, 'composables', scaffoldFileName('useJavaScript', 'composable', 'js', true)), composableTemplate('useJavaScript')],
        [join(root, 'server/api', scaffoldFileName('javascript.get.ts', 'api', 'js')), nitroDefaultTemplate]
    ]) { await writeFile(path, formatGeneratedContent(content, major === 3, 4, '\n')); }
    for (const [path, content] of snippetFixtures.nuxtFixtures(major)) {
        const file = join(app, path);
        await mkdir(join(file, '..'), { recursive: true });
        await writeFile(file, content);
    }
    await check(root, ['install']);
    await check(root, ['install', '--frozen-lockfile']);
    const generation = installedNitroMajor(root);
    await mkdir(join(root, 'server/tasks/db'), { recursive: true });
    await writeFile(join(root, 'server/tasks/db/migrate.ts'), nitroTaskTemplate('db:migrate', generation));
    const config = join(root, 'nuxt.config.ts');
    await writeFile(config, enableTasksSource(await readFile(config, 'utf8')));
    console.log('NITRO GENERATION: ' + generation);
    await check(root, ['exec', 'nuxt', 'prepare']);
    await check(root, ['exec', 'nuxt', 'typecheck']);
    await check(root, ['exec', 'nuxt', 'build']);
    console.log(`FIXTURE PASS: Nuxt ${major}, ${recipe}, ${root}`);
}
await fixture(3, 'module3');
await fixture(4, 'vite4');
