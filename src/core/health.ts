/** Inspect project health without executing configuration, changing files or exposing private project data. */
import { accessSync, constants, existsSync, readFileSync } from 'node:fs';
import { delimiter, dirname, join, relative } from 'node:path';
import semver from 'semver';
import { resolveDependency } from './catalogs';
import { readStaticConfig, resolveDirectories } from './directories';
import { ManagerName, detectManager, managerCommand, terminalCommand } from './managers';
import { ProjectContext, containsPath } from './project';

export interface HealthFinding { status: 'ok' | 'warning'; title: string; detail: string; }
export interface HealthReport { nuxt?: string; manager: ManagerName; findings: HealthFinding[]; }

/** Read only an installed manifest version, including dependencies hoisted to a package-manager workspace. */
export function installedNuxtVersion (project: ProjectContext): string | undefined {
    let root = project.root;
    while (containsPath(project.packageManagerRoot, root)) {
        try {
            const version = JSON.parse(readFileSync(join(root, 'node_modules/nuxt/package.json'), 'utf8')).version;
            if (semver.valid(version)) { return version; }
        } catch { /* A missing local package may be hoisted one directory higher. */ }
        if (root === project.packageManagerRoot) { break; }
        root = dirname(root);
    }
}

/** Check PATH for a usable package-manager executable without launching project code or network requests. */
export function toolAvailable (name: string, path = process.env.PATH || '', platform = process.platform): boolean {
    const suffixes = platform === 'win32' ? ['', '.exe', '.cmd', '.bat'] : [''];
    return path.split(delimiter).filter(Boolean).some(directory => suffixes.some(suffix => {
        try { accessSync(join(directory, name + suffix), platform === 'win32' ? constants.F_OK : constants.X_OK); return true; }
        catch { return false; }
    }));
}

/** Collect actionable checks using static metadata; deliberately omit config contents, declarations and raw errors. */
export function inspectProjectHealth (project: ProjectContext, fallback: ManagerName = 'NPM', available = toolAvailable): HealthReport {
    const findings: HealthFinding[] = [];
    const manager = detectManager(project.root, fallback) || fallback;
    const executable = managerCommand(manager, 'install', project.root).executable;
    findings.push({ status: available(executable) ? 'ok' : 'warning', title: 'Package manager', detail: `${executable}: ${available(executable) ? 'available in the extension host PATH.' : 'unavailable. Install it and restart VS Code so its PATH is refreshed.'}` });
    let dependencies: Record<string, unknown> = {};
    try {
        const manifest = JSON.parse(readFileSync(join(project.root, 'package.json'), 'utf8'));
        dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
        findings.push({ status: 'ok', title: 'Project manifest', detail: 'package.json is readable.' });
    } catch { findings.push({ status: 'warning', title: 'Project manifest', detail: 'Create or repair package.json before installing dependencies.' }); }
    let unresolved = 0;
    for (const [name, specifier] of Object.entries(dependencies)) {
        if (typeof specifier !== 'string' || !specifier.startsWith('catalog:')) { continue; }
        try { if (resolveDependency(project.root, name, specifier).error) { unresolved++; } }
        catch { unresolved++; }
    }
    findings.push({ status: unresolved ? 'warning' : 'ok', title: 'Workspace catalogs', detail: unresolved ? `${unresolved} catalog references are unresolved. Check catalog/catalogs entries in pnpm-workspace.yaml.` : 'No unresolved catalog references.' });
    const nuxt = installedNuxtVersion(project);
    findings.push({ status: nuxt ? 'ok' : 'warning', title: 'Installed Nuxt', detail: nuxt ? `Nuxt ${nuxt} is installed.` : 'Nuxt is not installed or its version is invalid. Install project dependencies before preparing types.' });
    let declared: string | undefined;
    try { if (typeof dependencies.nuxt === 'string') { declared = resolveDependency(project.root, 'nuxt', dependencies.nuxt).version; } } catch { /* Invalid declarations are reported through the unresolved version check. */ }
    const version = nuxt || declared;
    if (!version) { findings.push({ status: 'warning', title: 'Nuxt declaration', detail: 'Cannot resolve the Nuxt version from package.json or workspace catalogs.' }); }
    else if (semver.major(version) < 3 || semver.major(version) > 4) { findings.push({ status: 'warning', title: 'Supported version', detail: 'Nuxt 3 and 4 are actively supported. Other generations have limited validation.' }); }
    const generated = version && semver.major(version) >= 4 ? '.nuxt/tsconfig.app.json' : '.nuxt/tsconfig.json';
    const prepare = terminalCommand(managerCommand(manager, 'cli', '.', ['nuxt', 'prepare']));
    findings.push({ status: existsSync(join(project.root, generated)) ? 'ok' : 'warning', title: 'Generated types', detail: existsSync(join(project.root, generated)) ? `${generated} exists.` : `${generated} is missing. After installing dependencies, run ${prepare} from the project root.` });
    try {
        if (!version) { throw new Error('Unknown Nuxt version'); }
        const directories = resolveDirectories(project.root, readStaticConfig(project.configPath), semver.major(version));
        for (const name of ['app', 'server', 'public', 'shared'] as const) {
            const path = directories[name];
            findings.push({ status: 'ok', title: `${name} directory`, detail: containsPath(project.root, path) ? (relative(project.root, path).replaceAll('\\', '/') || '.') : 'An explicitly configured directory outside the project root (path omitted).' });
        }
    } catch { findings.push({ status: 'warning', title: 'Directory resolution', detail: 'Cannot safely resolve computed, inherited or invalid directory settings. Use literal settings or select an explicit Explorer folder for scaffolding.' }); }
    return { nuxt, manager, findings };
}

/** Format a shareable preview with allowlisted runtime metadata and no absolute paths, manifest contents or environment values. */
export function formatHealthReport (report: HealthReport, editorVersion: string, extensionVersion: string): string {
    return ['# Nuxtr project diagnostics', '', 'Review this report before copying or sharing. No source files, absolute paths or environment variables are included.', '',
        `- Nuxtr: ${extensionVersion}`, `- VS Code: ${editorVersion}`, `- Extension host: ${process.platform}/${process.arch}, Node ${process.versions.node}`,
        `- Package manager: ${report.manager}`, '', ...report.findings.flatMap(finding => [`## ${finding.status === 'ok' ? 'OK' : 'CHECK'} — ${finding.title}`, '', finding.detail, ''])].join('\n');
}
