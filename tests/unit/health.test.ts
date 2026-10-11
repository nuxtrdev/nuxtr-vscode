/** Verify actionable health checks, static-only configuration and privacy of shareable diagnostics. */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { formatHealthReport, inspectProjectHealth, installedNuxtVersion, toolAvailable } from '../../src/core/health';
const roots: string[] = [];
function fixture (source = 'export default defineNuxtConfig({})', dependencies?: Record<string, string>) {
    const root = mkdtempSync(join(tmpdir(), 'private-health-'));
    roots.push(root);
    writeFileSync(join(root, 'nuxt.config.ts'), source);
    writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: dependencies || { nuxt: '^4.6.1' } }));
    return { root, workspaceRoot: root, packageManagerRoot: root, configPath: join(root, 'nuxt.config.ts') };
}
afterEach(() => { for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }); } });
test('missing installations/types/tools have actionable warnings and do not change project files', () => {
    const project = fixture();
    const original = readFileSync(project.configPath, 'utf8');
    const report = inspectProjectHealth(project, 'pnpm', () => false);
    expect(report.nuxt).toBeUndefined();
    expect(report.findings.find(x => x.title === 'Installed Nuxt')?.status).toBe('warning');
    expect(report.findings.find(x => x.title === 'Generated types')?.detail).toContain('\'pnpm\' \'exec\' \'nuxt\' \'prepare\'');
    expect(report.findings.find(x => x.title === 'Package manager')?.detail).toContain('restart VS Code');
    expect(readFileSync(project.configPath, 'utf8')).toBe(original);
});
test('hoisted installed Nuxt and generated types are detected for a nested project', () => {
    const project = fixture();
    mkdirSync(join(project.root, 'apps/web'), { recursive: true });
    mkdirSync(join(project.root, 'node_modules/nuxt'), { recursive: true });
    writeFileSync(join(project.root, 'node_modules/nuxt/package.json'), '{"version":"4.6.1"}');
    const nested = { ...project, root: join(project.root, 'apps/web') };
    writeFileSync(join(nested.root, 'package.json'), '{"dependencies":{"nuxt":"^4.6.1"}}');
    mkdirSync(join(nested.root, '.nuxt'));
    writeFileSync(join(nested.root, '.nuxt/tsconfig.app.json'), '{}');
    expect(installedNuxtVersion(nested)).toBe('4.6.1');
    expect(inspectProjectHealth(nested).findings.find(x => x.title === 'Generated types')?.status).toBe('ok');
});
test('computed config is never evaluated and secrets or absolute paths never enter the report', () => {
    const project = fixture('export default defineNuxtConfig({srcDir: (() => { throw new Error("PRIVATE_TOKEN"); })()})', { nuxt: '^4.6.1', private: 'https://user:PRIVATE_TOKEN@example.com/pkg' });
    const report = formatHealthReport(inspectProjectHealth(project), '1.141.0', '0.2.16');
    expect(report).toContain('Cannot safely resolve');
    expect(report).not.toContain('PRIVATE_TOKEN');
    expect(report).not.toContain(project.root);
    expect(report).not.toContain('example.com');
});
test('catalog references include default/named entries and malformed YAML settles with warnings', () => {
    const project = fixture(undefined, { nuxt: 'catalog:', other: 'catalog:tools' });
    writeFileSync(join(project.root, 'pnpm-workspace.yaml'), 'catalog:\n  nuxt: ^4.6.1\n');
    expect(inspectProjectHealth(project).findings.find(x => x.title === 'Workspace catalogs')?.detail).toContain('1 catalog references');
    writeFileSync(join(project.root, 'pnpm-workspace.yaml'), 'catalog: [');
    expect(inspectProjectHealth(project).findings.find(x => x.title === 'Workspace catalogs')?.status).toBe('warning');
});
test('external directories and layer configurations provide useful diagnostics without publishing paths', () => {
    const project = fixture('export default defineNuxtConfig({srcDir: "/private/secret-project"})');
    const report = formatHealthReport(inspectProjectHealth(project), '1.141.0', '0.2.16');
    expect(report).toContain('outside the project root');
    expect(report).not.toContain('/private/secret-project');
    writeFileSync(project.configPath, 'export default defineNuxtConfig({extends: ["./base"]})');
    expect(inspectProjectHealth(project).findings.find(x => x.title === 'Directory resolution')?.status).toBe('warning');
});
test('PATH availability supports Windows shims and absent executables without executing them', () => {
    const project = fixture();
    writeFileSync(join(project.root, 'pnpm.cmd'), '@exit /b 1');
    expect(toolAvailable('pnpm', project.root, 'win32')).toBe(true);
    expect(toolAvailable('pnpm', project.root, 'darwin')).toBe(false);
});
