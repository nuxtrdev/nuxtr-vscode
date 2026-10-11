/** Run extension smoke tests through the official VS Code runner in isolated profiles. */
const { runTests } = require('@vscode/test-electron');
const { mkdtempSync, mkdirSync, writeFileSync, existsSync, chmodSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

/** Launch each requested workspace independently so activation state cannot leak between cases. */
async function main () {
    const root = resolve(__dirname, '..');
    const temporary = mkdtempSync(join(process.platform === 'darwin' ? '/tmp' : tmpdir(), 'nx-'));
    const cases = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['empty', 'non-nuxt', 'nuxt', 'nuxt4', 'nested', 'two-projects', 'compat4', 'custom', 'legacy4', 'nuxt2'];
    const vueLanguage = join(temporary, 'vue-language');
    mkdirSync(vueLanguage);
    writeFileSync(join(vueLanguage, 'package.json'), JSON.stringify({ name: 'fixture-vue', publisher: 'tests', version: '1.0.0', engines: { vscode: '*' }, contributes: { languages: [{ id: 'vue', extensions: ['.vue'] }] } }));
    const installed = '/Applications/Visual Studio Code.app/Contents/MacOS/Code';
    const executable = process.env.VSCODE_EXECUTABLE_PATH || (!process.env.CI && !process.env.VSCODE_TEST_VERSION && existsSync(installed) ? installed : undefined);
    delete process.env.ELECTRON_RUN_AS_NODE;
    for (const scenario of cases) {
        const folder = join(temporary, scenario);
        mkdirSync(folder, { recursive: true });
        if (!['empty', 'non-nuxt'].includes(scenario)) {
            const nested = scenario === 'nested' || scenario === 'two-projects';
            const project = nested ? join(folder, 'apps/web') : folder;
            const major = ['nuxt4', 'two-projects', 'custom', 'legacy4'].includes(scenario) ? 4 : (scenario === 'nuxt2' ? 2 : 3);
            mkdirSync(project, { recursive: true });
            writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'smoke', private: true, dependencies: { nuxt: major === 4 ? '^4.6.1' : (major === 2 ? '^2.18.1' : '^3.21.11') } }));
            const options = scenario === 'compat4' ? 'future: { compatibilityVersion: 4 },' : (scenario === 'custom' ? 'srcDir: "source/", serverDir: "backend/", dir: { public: "static-files/", pages: "screens/" },' : '');
            writeFileSync(join(project, 'nuxt.config.ts'), `export default defineNuxtConfig({ ${options} modules: [], plugins: [], extends: [] })\n`);
            writeFileSync(join(project, '.nuxtrc'), '\n');
            if (['nuxt4', 'compat4', 'two-projects'].includes(scenario)) {
                mkdirSync(join(project, 'app'), { recursive: true });
                writeFileSync(join(project, 'app/app.vue'), '<template><NuxtPage /></template>');
            }
            if (scenario === 'legacy4') { writeFileSync(join(project, 'app.vue'), '<template><NuxtPage /></template>'); }
            if (scenario === 'two-projects') {
                const other = join(folder, 'apps/admin');
                mkdirSync(other, { recursive: true });
                writeFileSync(join(other, 'package.json'), JSON.stringify({ dependencies: { nuxt: '^3.21.11' } }));
                writeFileSync(join(other, 'nuxt.config.ts'), 'export default defineNuxtConfig({})');
            }
            mkdirSync(join(project, 'public'), { recursive: true });
            const publicDirectory = scenario === 'custom' ? 'static-files' : (scenario === 'nuxt2' ? 'static' : 'public');
            mkdirSync(join(project, publicDirectory), { recursive: true });
            writeFileSync(join(project, publicDirectory, 'logo.svg'), '<svg></svg>');
            writeFileSync(join(project, 'blank.vue'), '');
            writeFileSync(join(project, 'wrap-test.vue'), '<script setup>const text = "value"</script>\n<template>\n  <span>first</span>\n  <span>second</span>\n</template>');
            writeFileSync(join(project, 'import-test.vue'), '<script setup>\nimport { vue');
            writeFileSync(join(project, 'asset-test.vue'), '<template><img src="/"></template>');
            writeFileSync(join(project, 'api-snippet-test.vue'), '<script setup lang="ts">\n\n</script>\n<template>\n\n</template>');
            const serverDirectory = scenario === 'custom' ? 'backend' : 'server';
            mkdirSync(join(project, serverDirectory, 'api'), { recursive: true });
            for (const extension of ['ts', 'js']) { writeFileSync(join(project, serverDirectory, 'api/snippet-test.' + extension), ''); }
            writeFileSync(join(project, serverDirectory, 'api/import-test.ts'), 'import { get');
            writeFileSync(join(project, 'client-snippet-test.ts'), '');
            writeFileSync(join(folder, 'pnpm-lock.yaml'), 'lockfileVersion: \'9.0\'\n');
        }
        const binaries = join(folder, 'test-bin');
        mkdirSync(binaries, { recursive: true });
        writeFileSync(join(binaries, 'pm.cjs'), 'console.log(JSON.stringify({}));\n');
        for (const manager of ['pnpm', 'npm', 'yarn', 'bun']) {
            const executable = join(binaries, manager);
            writeFileSync(executable, '#!/usr/bin/env node\nconsole.log(JSON.stringify({}));\n');
            chmodSync(executable, 0o755);
            writeFileSync(executable + '.cmd', '@node "%~dp0pm.cjs" %*\r\n');
        }
        // Keep first-run welcome/chat editors from taking focus during editor-command assertions.
        const profile = join(temporary, scenario + '-profile');
        mkdirSync(join(profile, 'User'), { recursive: true });
        writeFileSync(join(profile, 'User/settings.json'), JSON.stringify({
            'workbench.startupEditor': 'none',
            'chat.disableAIFeatures': true,
            'window.restoreWindows': 'none',
            'workbench.editor.enablePreview': false,
        }));
        await runTests({
            extensionDevelopmentPath: [process.env.NUXTR_EXTENSION_PATH || root, vueLanguage],
            extensionTestsPath: join(root, 'tests/integration/smoke.cjs'),
            vscodeExecutablePath: executable,
            version: process.env.VSCODE_TEST_VERSION || '1.141.0',
            extensionTestsEnv: { NUXTR_SCENARIO: scenario, PATH: binaries + require('node:path').delimiter + process.env.PATH },
            launchArgs: [
                ...(scenario === 'empty' ? [] : [folder]),
                '--user-data-dir=' + profile,
                '--extensions-dir=' + join(temporary, scenario + '-extensions'),
                '--disable-extensions', '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes'
            ]
        });
    }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
