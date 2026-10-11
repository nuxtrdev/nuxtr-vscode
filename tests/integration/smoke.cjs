/** Smoke-test the bundled extension and sidebar in a real VS Code extension host. */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const vscode = require('vscode');

/** Activate the isolated native test window and wait for its focus event before routing editor commands. */
async function focusTestWindow () {
    // Sequential Electron instances share a macOS bundle ID; activate this host's parent process explicitly.
    if (process.platform === 'darwin') {
        execFileSync('/usr/bin/osascript', ['-l', 'JavaScript', '-e',
            `ObjC.import('AppKit'); $.NSRunningApplication.runningApplicationWithProcessIdentifier(${process.ppid}).activateWithOptions(2);`], { timeout: 5000 });
    }
    await vscode.commands.executeCommand('workbench.action.switchToMainWindow');
    if (vscode.window.state.focused) { return; }
    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { listener.dispose(); reject(new Error('The native test window did not gain focus.')); }, 5000);
        const listener = vscode.window.onDidChangeWindowState(state => {
            if (state.focused) { clearTimeout(timer); listener.dispose(); resolve(); }
        });
    });
}

/** Wait for the document mirror to receive an editor operation after its command promise settles. */
function documentText (document, expected) {
    if (document.getText() === expected) { return Promise.resolve(); }
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { listener.dispose(); reject(new Error('Editor change did not reach the document mirror.')); }, 5000);
        const listener = vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document === document && document.getText() === expected) { clearTimeout(timer); listener.dispose(); resolve(); }
        });
    });
}

/** Verify public activation and, for a Nuxt workspace, project commands and packaged sidebar assets. */
exports.run = async function run () {
    const extension = vscode.extensions.all.find(e => e.packageJSON.name === 'nuxtr-vscode');
    assert(extension, 'Development extension must be installed');
    await extension.activate();
    console.log('NUXTR_SMOKE_ENV: ' + JSON.stringify({ scenario: process.env.NUXTR_SCENARIO, vscode: vscode.version, platform: process.platform, arch: process.arch, extension: extension.id, version: extension.packageJSON.version }));
    const commands = await vscode.commands.getCommands();
    assert(commands.includes('nuxtr.createProject'), 'Project creation must be available');
    if (!['empty', 'non-nuxt'].includes(process.env.NUXTR_SCENARIO)) {
        assert(commands.includes('nuxtr.createComponent'));
        assert(commands.includes('nuxtr.createNitroTask'));
        assert(commands.includes('nuxtr.directCreateNitroTask'));
        assert(commands.includes('nuxtr.enableNitroTasks'));
        const palette = extension.packageJSON.contributes.menus.commandPalette;
        assert.equal(palette.find(menu => menu.command === 'nuxtr.directCreateNitroTask')?.when, 'false', 'Explorer-only task command must stay hidden in the palette');
        assert.equal(palette.find(menu => menu.command === 'nuxtr.createNitroTask')?.when, 'nuxtr.isNuxtProject', 'Palette task command must be scoped to Nuxt projects');
        const explorer = extension.packageJSON.contributes.menus['explorer/context'];
        assert(explorer.find(menu => menu.command === 'nuxtr.projectStructure').when.includes('resourcePath in nuxtr.applicationDirectories'));
        for (const command of ['nuxtr.createNitroAPI', 'nuxtr.createNitroUtil']) {
            assert(commands.includes(command), 'Server-root actions must be registered');
            assert(explorer.find(menu => menu.command === command).when.includes('resourcePath in nuxtr.serverDirectories'));
        }
        const build = 'out/sidebar';
        assert(existsSync(join(extension.extensionPath, build, 'assets/index.js')));
        assert(existsSync(join(extension.extensionPath, build, 'assets/index.css')));
        await vscode.commands.executeCommand('workbench.view.extension.sidebar-view');
        const root = ['nested', 'two-projects'].includes(process.env.NUXTR_SCENARIO)
            ? vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'apps/web') : vscode.workspace.workspaceFolders[0].uri;
        const project = await vscode.commands.executeCommand('nuxtr.selectProject', root);
        assert.equal(project.root, root.fsPath);
        if (process.env.NUXTR_SCENARIO === 'two-projects') {
            const other = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'apps/admin');
            assert.equal((await vscode.commands.executeCommand('nuxtr.selectProject', other)).root, other.fsPath);
            await assert.rejects(vscode.commands.executeCommand('nuxtr.selectProject', vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'unrelated')), /outside/);
            await vscode.commands.executeCommand('nuxtr.selectProject', root);
        }
        // Finish the sidebar activation check before exercising editor focus and Undo.
        await vscode.commands.executeCommand('workbench.action.closeSidebar');
        await vscode.commands.executeCommand('workbench.action.closePanel');
        const wrappedDocument = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, 'wrap-test.vue'));
        const wrappingEditor = await vscode.window.showTextDocument(wrappedDocument);
        const wrappingOriginal = wrappedDocument.getText();
        wrappingEditor.selections = ['first', 'second'].map(text => {
            const start = wrappingOriginal.indexOf('<span>' + text);
            return new vscode.Selection(wrappedDocument.positionAt(start), wrappedDocument.positionAt(start + ('<span>' + text + '</span>').length));
        });
        assert.equal(await vscode.commands.executeCommand('nuxtr.wrapWithNuxtComponent', 'ClientOnly'), true);
        assert(wrappedDocument.getText().includes('<ClientOnly><span>first</span></ClientOnly>'));
        assert(wrappedDocument.getText().includes('<ClientOnly><span>second</span></ClientOnly>'));
        // Let sidebar activation settle before claiming native and editor focus immediately before Undo.
        await new Promise(resolve => setTimeout(resolve, 150));
        await focusTestWindow();
        await vscode.window.showTextDocument(wrappedDocument, { preview: false, preserveFocus: false });
        // Undo routing requires editor focus; wait for the resulting document event before asserting.
        await vscode.commands.executeCommand('default:undo');
        await documentText(wrappedDocument, wrappingOriginal);
        assert.equal(wrappedDocument.getText(), wrappingOriginal, 'Multiple wrappers must undo in one step');
        const health = await vscode.commands.executeCommand('nuxtr.projectHealthCheck', root);
        assert(health.includes('Generated types'));
        assert(!health.includes(root.fsPath), 'Shareable diagnostics must omit absolute paths');
        assert(health.includes('Nuxt is not installed'), 'Declared Nuxt must not masquerade as installed');
        const config = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, 'nuxt.config.ts'));
        const lenses = await vscode.commands.executeCommand('vscode.executeCodeLensProvider', config.uri);
        assert(lenses.some(lens => lens.command?.command === 'nuxtr.createModuleAction'), 'Nuxt config module actions must be available');
        const configEditor = await vscode.window.showTextDocument(config);
        const originalConfig = config.getText();
        const moduleSource = originalConfig.replace('modules: []', 'modules: ["@nuxt/"]');
        const completeRange = new vscode.Range(config.positionAt(0), config.positionAt(config.getText().length));
        await configEditor.edit(builder => builder.replace(completeRange, moduleSource));
        const modulePosition = config.positionAt(moduleSource.indexOf('@nuxt/') + 6);
        const moduleItems = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', config.uri, modulePosition);
        assert.equal(moduleItems.items.some(item => item.label === '@nuxt/eslint'), process.env.NUXTR_SCENARIO !== 'nuxt2', 'Module completion must load offline data and filter incompatible Nuxt generations');
        await vscode.workspace.getConfiguration('nuxtr').update('intellisense.nuxtModules', false, vscode.ConfigurationTarget.Workspace);
        const modulesOff = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', config.uri, modulePosition);
        assert(!modulesOff.items.some(item => item.label === '@nuxt/eslint'), 'Module completion toggles must apply immediately');
        await vscode.workspace.getConfiguration('nuxtr').update('intellisense.nuxtModules', true, vscode.ConfigurationTarget.Workspace);
        await configEditor.edit(builder => builder.replace(new vscode.Range(config.positionAt(0), config.positionAt(config.getText().length)), originalConfig));
        const document = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, '.nuxtrc'));
        await vscode.window.showTextDocument(document);
        const completions = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', document.uri, new vscode.Position(0, 0));
        assert(completions?.items.some(item => item.label === 'srcDir'), 'Nuxt configuration schema must load in the bundled host');
        const vue = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, 'asset-test.vue'));
        const assets = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', vue.uri, new vscode.Position(0, vue.getText().indexOf('src="/') + 6));
        assert(assets?.items.some(item => item.label === 'logo.svg'), 'Public assets must resolve outside Nuxt 4 appDir');
        const manifestPath = join(extension.extensionPath, 'package.json');
        const originalManifest = readFileSync(manifestPath, 'utf8');
        const blank = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, 'blank.vue'));
        const enabled = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', blank.uri, new vscode.Position(0, 0));
        assert(enabled.items.some(item => item.label === 'vueBase'));
        await vscode.workspace.getConfiguration('nuxtr').update('snippets.nuxt', false, vscode.ConfigurationTarget.Workspace);
        const disabled = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', blank.uri, new vscode.Position(0, 0));
        assert(!disabled.items.some(item => item.label === 'vueBase'), 'Snippet toggle must apply without reload');
        await vscode.workspace.getConfiguration('nuxtr').update('snippets.nuxt', true, vscode.ConfigurationTarget.Workspace);
        const importing = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, 'import-test.vue'));
        const importItems = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', importing.uri, new vscode.Position(1, 12));
        assert(!importItems.items.some(item => item.label === 'vueBase'));
        const api = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, 'api-snippet-test.vue'));
        const script = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', api.uri, new vscode.Position(1, 0));
        assert(script.items.some(item => item.label === 'useFetch'), 'Nuxt composables must be available in Vue scripts');
        assert(!script.items.some(item => item.label === 'NuxtPage'), 'Component snippets must stay outside Vue scripts');
        const nuxt4 = ['nuxt4', 'two-projects', 'custom', 'legacy4'].includes(process.env.NUXTR_SCENARIO);
        assert.equal(script.items.some(item => item.label === 'createUseFetch'), nuxt4, 'Factory snippets must honor the Nuxt version requirement');
        const template = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', api.uri, new vscode.Position(4, 0));
        assert(template.items.some(item => item.label === 'NuxtPage'), 'Documented components must be available in Vue templates');
        assert(!template.items.some(item => item.label === 'useFetch'), 'Composable snippets must stay outside Vue templates');
        assert.equal(template.items.some(item => item.label === 'NuxtAnnouncer'), nuxt4, 'Component version guards must match the selected project');
        await vscode.workspace.getConfiguration('nuxtr').update('snippets.nuxt', false, vscode.ConfigurationTarget.Workspace);
        const apiOff = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', api.uri, new vscode.Position(1, 0));
        assert(!apiOff.items.some(item => item.label === 'useFetch'), 'Expanded API snippets must honor the existing toggle');
        await vscode.workspace.getConfiguration('nuxtr').update('snippets.nuxt', true, vscode.ConfigurationTarget.Workspace);
        const serverDirectory = process.env.NUXTR_SCENARIO === 'custom' ? 'backend' : 'server';
        for (const extension of ['ts', 'js']) {
            const server = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root, serverDirectory, 'api/snippet-test.' + extension));
            const h3 = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', server.uri, new vscode.Position(0, 0));
            assert(h3.items.some(item => item.label === 'h3ReadBody'), 'H3 snippets must resolve the server directory in JavaScript and TypeScript');
            await vscode.workspace.getConfiguration('nuxtr').update('snippets.nitro', false, vscode.ConfigurationTarget.Workspace);
            const off = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', server.uri, new vscode.Position(0, 0));
            assert(!off.items.some(item => item.label === 'h3ReadBody'), 'The Nitro toggle must apply to H3 without reloading');
            await vscode.workspace.getConfiguration('nuxtr').update('snippets.nitro', true, vscode.ConfigurationTarget.Workspace);
        }
        for (const uri of [vscode.Uri.joinPath(root, 'client-snippet-test.ts'), blank.uri, vscode.Uri.joinPath(root, serverDirectory, 'api/import-test.ts')]) {
            const outside = await vscode.workspace.openTextDocument(uri);
            const items = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, outside.positionAt(outside.getText().length));
            assert(!items.items.some(item => item.label === 'h3ReadBody'), 'H3 must be suppressed in application files, Vue templates and imports');
        }
        assert.equal(readFileSync(manifestPath, 'utf8'), originalManifest, 'Snippet toggles must never rewrite installed manifests');
    }
    assert(!extension.packageJSON.contributes.languages.some(x => x.id === 'Log'));
    const log = await vscode.workspace.openTextDocument({ language: 'log', content: 'INFO ordinary log output' });
    assert.equal(log.languageId, 'log', 'Nuxtr must preserve the built-in log language');
    console.log('NUXTR_SMOKE_PASS: ' + process.env.NUXTR_SCENARIO);
};
