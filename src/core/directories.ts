/** Resolve literal Nuxt layouts without executing configuration or guessing inherited/computed paths. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseModule } from 'magicast';
export type DirectoryKind = 'app' | 'server' | 'public' | 'shared' | 'modules' | 'layers' | 'pages' | 'layouts' | 'components' | 'composables' | 'plugins' | 'middleware' | 'assets' | 'utils' | 'store' | 'stores' | 'static';
export type NuxtDirectories = Record<DirectoryKind, string>;

/** Read a static object or defineNuxtConfig object; dynamic exports require explicit manual configuration. */
export function readStaticConfig (path: string): Record<string, any> {
    try {
        const module = parseModule(readFileSync(path, 'utf8'), { sourceFileName: path });
        const exported = module.exports.default;
        const config = exported.$type === 'function-call' ? exported.$args[0] : exported;
        if (config.$type !== 'object') { throw new Error('Configuration must export a literal object.'); }
        return config;
    } catch (error) { throw new Error(`Cannot safely resolve ${path}: ${String(error)}. Use literal directory settings or create the file from its Explorer folder.`); }
}

/** Accept a literal directory string, rejecting expressions that cannot be safely resolved. */
function directoryValue (value: unknown, key: string, fallback: string): string {
    if (value === undefined) { return fallback; }
    if (typeof value !== 'string' || !value.trim()) { throw new Error(`${key} must be a literal nonempty directory string. Use an Explorer folder for computed settings.`); }
    return value;
}

/** Match installed Nuxt schema layout behavior, including compatibility v4 and legacy app-directory detection. */
export function resolveDirectories (projectRoot: string, config: Record<string, any>, major: number, exists = existsSync, list: (path: string) => string[] = path => readdirSync(path)): NuxtDirectories {
    if (config.extends && config.extends.length > 0) { throw new Error('Directory settings may be inherited from layers. Use an Explorer folder or make the directory settings explicit before scaffolding.'); }
    const root = resolve(projectRoot, directoryValue(config.rootDir, 'rootDir', '.'));
    const compatibility = config.future?.compatibilityVersion;
    if (compatibility !== undefined && typeof compatibility !== 'number') { throw new Error('future.compatibilityVersion must be literal to resolve the layout.'); }
    const modern = major >= 4 || compatibility === 4;
    const application = resolve(root, 'app');
    const dirs = config.dir || {};
    if (dirs.$type && dirs.$type !== 'object') { throw new Error('dir must be a literal object to resolve the layout.'); }
    let defaultApp = root;
    if (modern && exists(application)) {
        let populated = false;
        try { populated = list(application).some(name => name !== 'spa-loading-template.html' && !name.startsWith('router.options')); } catch { /* Unreadable directories do not demonstrate a modern layout. */ }
        const legacy = ['app.vue', 'App.vue', ...['assets', 'layouts', 'middleware', 'pages', 'plugins'].map(key => directoryValue(dirs[key], `dir.${key}`, key))].some(name => exists(resolve(root, name)));
        defaultApp = populated || !legacy ? application : root;
    }
    const app = resolve(root, directoryValue(config.srcDir, 'srcDir', defaultApp));
    const result = { app,
        server: resolve(modern ? root : app, directoryValue(config.serverDir, 'serverDir', 'server')),
        public: resolve(modern ? root : app, directoryValue(dirs.public, 'dir.public', major === 2 ? 'static' : 'public')),
        shared: resolve(root, directoryValue(dirs.shared, 'dir.shared', 'shared')),
        modules: resolve(root, directoryValue(dirs.modules, 'dir.modules', 'modules')),
        layers: resolve(root, 'layers') } as NuxtDirectories;
    for (const key of ['pages', 'layouts', 'components', 'composables', 'plugins', 'middleware', 'assets', 'utils', 'store', 'stores', 'static'] as const) {
        result[key] = resolve(app, directoryValue(dirs[key], `dir.${key}`, key));
    }
    return result;
}
