/** Discover Nuxt projects and choose resource-specific roots without VS Code or application evaluation. */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

export interface ProjectContext {
    root: string;
    configPath: string;
    workspaceRoot: string;
    packageManagerRoot: string;
}
const excludedDirectories = new Set(['node_modules', '.git', '.nuxt', '.output', 'out', 'dist', 'build', '.cache', '.turbo', '.vscode-test']);
export const configNames = ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs', 'nuxt.config.cjs', '.config/nuxt.ts'];

/** Test containment using path components rather than prefixes, including on Windows. */
export function containsPath (root: string, path: string): boolean {
    const child = relative(resolve(root), resolve(path));
    return child === '' || (!child.startsWith('../') && !child.startsWith('..\\') && child !== '..' && !isAbsolute(child));
}

/** Find the first supported root or .config Nuxt configuration. */
export function configAt (root: string): string | undefined {
    return configNames.map(name => join(root, name)).find(path => existsSync(path));
}

/** Walk parents to the nearest package-manager workspace or lockfile without crossing the workspace boundary. */
export function managerRoot (root: string, boundary: string): string {
    let current = root;
    while (containsPath(boundary, current)) {
        if (['pnpm-workspace.yaml', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lock', 'bun.lockb'].some(file => existsSync(join(current, file)))) { return current; }
        if (current === boundary) { break; }
        current = dirname(current);
    }
    return root;
}

/** Scan workspace folders while skipping generated/dependency directories and directory symlinks. */
export function discoverProjects (roots: string[]): ProjectContext[] {
    const projects = new Map<string, ProjectContext>();
    /** Visit a directory once and collect its configuration before descending into child directories. */
    function visit (root: string, workspaceRoot: string) {
        const configPath = configAt(root);
        if (configPath) { projects.set(root, { root, configPath, workspaceRoot, packageManagerRoot: managerRoot(root, workspaceRoot) }); }
        try {
            for (const entry of readdirSync(root, { withFileTypes: true })) {
                if (entry.isDirectory() && !excludedDirectories.has(entry.name)) { visit(join(root, entry.name), workspaceRoot); }
            }
        } catch { /* An unreadable folder cannot provide a project; other folders remain available. */ }
    }
    for (const root of roots) { visit(resolve(root), resolve(root)); }
    return [...projects.values()].sort((a, b) => a.root.localeCompare(b.root));
}

/** Pick the deepest project containing a command resource, so nested applications beat their parent. */
export function projectForResource (projects: ProjectContext[], resource?: string): ProjectContext | undefined {
    if (!resource) { return; }
    return projects.filter(project => containsPath(project.root, resource)).sort((a, b) => b.root.length - a.root.length)[0];
}
