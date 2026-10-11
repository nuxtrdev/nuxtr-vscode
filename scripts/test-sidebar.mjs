/** Exercise the production sidebar in an isolated browser with a fixture host, restrictive CSP and no live services. */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { createJiti } from 'jiti';
const jiti = createJiti(import.meta.url);
const { sidebarHtml } = await jiti.import('../src/core/webview.ts');
const { normalizeCatalogue } = await jiti.import('../src/core/catalogue.ts');
const { parseSidebarRequest } = await jiti.import('../src/core/messages.ts');
const modules = normalizeCatalogue(JSON.parse(await readFile(new URL('../src/content/modules.json', import.meta.url), 'utf8')));
const nonce = 'fixtureSidebarNonce';
const evidenceDirectory = process.env.NUXTR_ARTIFACT_DIR || tmpdir();
mkdirSync(evidenceDirectory, { recursive: true });
const bridge = `window.fixtureHost = {
 installResult: undefined, transportError: false, route: 'modules', action: window.fixtureInitialAction,
 requests: [], emit(message) { window.dispatchEvent(new MessageEvent('message', { data: message })); },
 navigate(command) {
 if (command === 'addModule' || command === 'addLayer') { this.route = 'modules'; this.action = command; }
 else { this.route = command; this.action = undefined; }
 this.emit({ command: this.route }); if (this.action) this.emit({ command: this.action });
 },
 ready() {
 this.emit({ command: this.route }); if (this.action) this.emit({ command: this.action });
 this.emit({ command: 'moduleCatalogue', data: { modules: ${JSON.stringify(modules)}, source: 'snapshot', updatedAt: 1791590400000, stale: true, projectVersion: '4.6.1' } });
 this.emit({ command: 'installedModules', data: [{ name: 'nuxt', version: '4.6.1' }] });
 this.emit({ command: 'projectViewData', data: { scripts: { build: 'nuxt build' }, dependencies: [{ name: 'nuxt', version: '4.6.1' }], snippets: ['example.code-snippets'], fileTemplates: ['custom.component-template'] } });
 this.emit({ command: 'outdatedDependencies', data: [{ name: 'nuxt', current: '4.6.1', latest: '4.6.2' }] });
 }
}; window.acquireVsCodeApi = () => ({ getState() {}, setState(value) { return value; }, postMessage(message) {
 if (window.fixtureHost.transportError) throw new Error('Fixture transport unavailable');
 message = structuredClone(message);
 window.fixtureHost.requests.push(message);
 setTimeout(() => {
  if (message.command === 'ready') window.fixtureHost.ready();
  if (message.command === 'refreshCatalogue') window.fixtureHost.emit({ command: 'moduleCatalogue', data: { modules: ${JSON.stringify(modules)}, source: 'cache', updatedAt: 1791590400000, projectVersion: '4.6.1', error: 'Offline' } });
  if (message.command === 'installModule' && window.fixtureHost.installResult) window.fixtureHost.emit({ command: 'moduleInstalled', cmd: message.module.npm, ...window.fixtureHost.installResult });
 }, 10);
} });`;
const themes = '<style>body { margin:0; padding:0; font-family:system-ui; --vscode-foreground:#eee; --vscode-sideBar-background:#181818; --vscode-dropdown-background:#252525; --vscode-dropdown-border:#555; --vscode-textLink-foreground:#4daafc; --vscode-descriptionForeground:#bbb; --vscode-list-hoverBackground:#333; --vscode-list-activeSelectionBackground:#444; background:var(--vscode-sideBar-background); color:var(--vscode-foreground); } body.vscode-light { --vscode-foreground:#222; --vscode-sideBar-background:#fff; --vscode-dropdown-background:#eee; --vscode-dropdown-border:#777; --vscode-textLink-foreground:#005fb8; --vscode-descriptionForeground:#555; --vscode-list-hoverBackground:#eee; --vscode-list-activeSelectionBackground:#ddd; }</style>';
const html = sidebarHtml({ css: '/assets/index.css', js: '/assets/index.js', source: '\'self\'', nonce }).replace('</head>', `${themes}<script nonce="${nonce}">${bridge}</script></head>`);
const server = createServer(async (request, response) => {
    try {
        const asset = request.url?.startsWith('/assets/') ? request.url.slice(8) : undefined;
        if (asset && !['index.js', 'index.css'].includes(asset)) { response.writeHead(404).end(); return; }
        response.setHeader('Content-Type', asset?.endsWith('.js') ? 'text/javascript' : (asset ? 'text/css' : 'text/html'));
        response.end(asset ? await readFile(resolve('out/sidebar/assets', asset)) : html);
    } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const address = server.address();
const installedChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(installedChrome) ? installedChrome : undefined), headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 380, height: 800 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:') ? route.continue() : route.abort());
    // Simulate the CodeLens intent queued before a cold sidebar's Vue application exists.
    await page.addInitScript(() => { globalThis.fixtureInitialAction = 'addModule'; });
    await page.goto('http://127.0.0.1:' + address.port);
    const search = page.getByPlaceholder('Search Integrations...');
    await search.waitFor();
    await page.getByRole('button', { name: /Filters/ }).click();
    await page.getByRole('button', { name: 'Integration type Modules', exact: true }).waitFor();
    await page.getByRole('button', { name: /Filters/ }).click();
    for (const action of ['addLayer', 'addModule']) {
        await page.evaluate(() => globalThis.fixtureHost.navigate('projectView'));
        await page.getByRole('button', { name: 'Dependencies', exact: true }).waitFor();
        await page.evaluate(command => globalThis.fixtureHost.navigate(command), action);
        await search.waitFor();
        await page.getByRole('button', { name: /Filters/ }).click();
        await page.getByRole('button', { name: 'Integration type ' + (action === 'addLayer' ? 'Layers' : 'Modules'), exact: true }).waitFor();
        await page.getByRole('button', { name: /Filters/ }).click();
    }
    await search.fill('eslint');
    const eslint = page.getByRole('article', { name: 'Module @nuxt/eslint', exact: true });
    await eslint.waitFor();
    await page.evaluate(() => { globalThis.fixtureHost.installResult = { installed: false, configured: false, error: 'Fixture package-manager failure' }; });
    await eslint.getByRole('button', { name: 'Install', exact: true }).click();
    await eslint.getByRole('button', { name: 'Install', exact: true }).waitFor();
    await search.fill('aos');
    const aos = page.getByRole('article', { name: 'Module nuxt-aos', exact: true });
    await aos.waitFor();
    await aos.getByRole('button', { name: 'Docs', exact: true }).click();
    await aos.getByRole('button', { name: 'Install', exact: true }).click();
    await page.waitForFunction(() => globalThis.fixtureHost.requests.some(message => message.command === 'installModule' && message.module.npm === 'nuxt-aos'), undefined, { timeout: 5000 });
    await aos.getByRole('alert').filter({ hasText: 'Fixture package-manager failure' }).waitFor();
    await page.evaluate(() => { globalThis.fixtureHost.transportError = true; });
    await aos.getByRole('button', { name: 'Install', exact: true }).click();
    await aos.getByRole('alert').filter({ hasText: 'Could not request installation' }).waitFor();
    assert.equal(await aos.getByRole('button', { name: 'Install', exact: true }).isEnabled(), true);
    await page.evaluate(() => { globalThis.fixtureHost.transportError = false; globalThis.fixtureHost.installResult = undefined; });
    await aos.getByRole('button', { name: 'Install', exact: true }).click();
    const pending = aos.getByRole('button', { name: 'Installing', exact: true });
    await pending.waitFor();
    assert.equal(await pending.isDisabled(), true);
    await page.evaluate(() => globalThis.fixtureHost.emit({ command: 'moduleInstalled', cmd: 'different-module', installed: true, configured: true }));
    assert.equal(await pending.isVisible(), true, 'Another module result must not settle this installation');
    await page.evaluate(() => globalThis.fixtureHost.emit({ command: 'moduleInstalled', cmd: 'nuxt-aos', installed: true, configured: false, error: 'Computed Nuxt configuration' }));
    await aos.getByRole('button', { name: 'Installed', exact: true }).waitFor();
    await aos.getByRole('alert').filter({ hasText: 'Installed, but configuration failed' }).waitFor();
    await page.evaluate(() => globalThis.fixtureHost.emit({ command: 'moduleInstalled', cmd: 'nuxt-aos', installed: true, configured: true }));
    await aos.getByRole('alert').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Refresh catalogue' }).click();
    await page.getByRole('status').filter({ hasText: 'Offline' }).waitFor();
    await page.getByRole('button', { name: /Filters/ }).click();
    const versions = page.getByRole('button', { name: 'Nuxt version Project', exact: true });
    await versions.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: '4.x', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: '4.x', exact: true }).isVisible(), false);
    await page.getByRole('button', { name: /Filters/ }).click();
    await page.getByRole('button', { name: 'Nuxt version Project', exact: true }).waitFor({ state: 'hidden' });
    await page.screenshot({ path: join(evidenceDirectory, 'nuxtr-sidebar-dark.png'), animations: 'disabled' });
    await page.evaluate(() => { document.body.className = 'vscode-light'; globalThis.fixtureHost.navigate('projectView'); });
    const dependencies = page.getByRole('button', { name: 'Dependencies', exact: true });
    await dependencies.focus();
    await page.keyboard.press('Enter');
    const release = page.getByRole('button', { name: 'Release notes for nuxt' });
    await release.waitFor();
    await release.click();
    await page.getByRole('button', { name: 'Share an idea' }).waitFor();
    await page.screenshot({ path: join(evidenceDirectory, 'nuxtr-sidebar-light.png'), animations: 'disabled' });
    const requests = await page.evaluate(() => globalThis.fixtureHost.requests);
    assert.ok(requests.every(message => parseSidebarRequest(message)), 'Rendered sidebar requests must pass the actual extension-host validator');
    assert.ok(requests.some(message => message.command === 'installModule' && message.module.npm === '@nuxt/eslint'));
    assert.ok(requests.some(message => message.command === 'installModule' && message.module.npm === 'nuxt-aos'));
    assert.ok(requests.some(message => message.command === 'openExternal' && message.url === 'https://github.com/egidiusmengelberg/nuxt-aos'));
    assert.ok(requests.some(message => message.command === 'openPackageReleaseNotes' && message.name === 'nuxt'));
    assert.deepEqual(errors, [], 'Production sidebar must render without browser errors');
    console.log('PASS: cold-sidebar and Project-to-module/layer first-click navigation, production CSP, cloneable module requests, nuxt-aos install/retry/results/docs, offline catalogue, keyboard menus, themes and release-note action');
} finally { await browser.close(); await new Promise(done => server.close(done)); }
