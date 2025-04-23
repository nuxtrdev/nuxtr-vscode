import { pathExistsSync } from 'fs-extra';
import { parseModule } from 'magicast';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { trimEnd } from 'string-ts';
import { window } from 'vscode';
import { projectRootDirectory } from '.';

export const findNuxtConfig = (): string | undefined => {
    const names = ['nuxt.config.ts', 'nuxt.config.js'];

    for (const name of names) {
        const path = `${projectRootDirectory()}/${name}`;
        if (existsSync(path)) { return path; }
    }
};

const isLayer = (module: any) => {
    const modulePath = `${projectRootDirectory()}/node_modules/${module.npm}`;

    if (existsSync(modulePath)) {
        const nuxtConfigPath = `${modulePath}/nuxt.config.ts`;
        const result = pathExistsSync(nuxtConfigPath)
        return result ? true : false;
    }
};


export const isModuleConfigured = (module: string) => {
    const nuxtConfigPath = findNuxtConfig();
    const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf8');

    const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });

    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    const layer = isLayer(module);

    if (layer) {
        config.extends ||= [];
        return config.extends.includes(module);
    } else {
        config.modules ||= [];
        return config.modules.includes(module);
    }
}


export const removeNuxtModule = (module: any) => {
    try {
        const nuxtConfigPath = findNuxtConfig();
        const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf8');

        const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
        const config =
            mod.exports.default.$type === 'function-call'
                ? mod.exports.default.$args[0]
                : mod.exports.default;

        const layer = isLayer(module);

        if (layer) {
            config.extends ||= [];

            for (let i = 0; i < config.extends.length; i++) {
                if (config.extends[i] === module) {
                    config.extends.splice(i, 1);
                }
            }

        } else {
            config.modules ||= [];
            for (let i = 0; i < config.modules.length; i++) {
                if (config.modules[i] === module) {
                    config.modules.splice(i, 1);
                }
            }
        }


        const generated = mod.generate().code;
        writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf8');
    } catch (error) {
        window.showErrorMessage(
            `${module} failed to uninstall, please uninstall it manually, ${error}`
        );
    }
};

export const isNuxtProject = () => {
    const names = ['nuxt.config.ts', 'nuxt.config.js'];

    for (const name of names) {
        const path = `${projectRootDirectory()}/${name}`;
        const result = pathExistsSync(path);
        if (result) { return true } else { continue }
    }

    return false;
};

export const getNuxtVersion = (): string | undefined => {
    const packageJsonPath = `${projectRootDirectory()}/package.json`;
    if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };
        if ('nuxt' in dependencies) {
            const nuxtVersion = dependencies.nuxt;

            if (!nuxtVersion.includes('catalog:')) {
                return nuxtVersion.replace('^', '');
            }

            const workspaceConfigPath = `${projectRootDirectory()}/pnpm-workspace.yaml`;
            const workspaceConfig = readFileSync(workspaceConfigPath, 'utf8')

            const regex = /[\s]['"]?nuxt['"]?[\s]*:[^0-9\n\r]*(?<version>[0-9]+(?:\.[0-9]+){0,2})/g
            const matches = regex.exec(workspaceConfig)

            return matches?.groups?.version
        }
    } else {
        return;
    }
};

export const hasSrcDir = async (): Promise<string> => {
    const isNuxt = await isNuxtProject();
    if (!isNuxt) {
        return '/'
    }
    const nuxtConfigPath = findNuxtConfig();
    const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf8');

    const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    return config.srcDir ? `/${config.srcDir}` : '/';
};


export const hasServerDir = async (): Promise<string> => {
    const isNuxt = await isNuxtProject();
    if (!isNuxt) {
        return 'server'
    }
    const nuxtConfigPath = findNuxtConfig();
    const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf8');

    const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    return config.serverDir ? `${config.serverDir}` : 'server';
};

export const isNuxtTwo = (): boolean | undefined => {
    const nuxtVersion = getNuxtVersion();
    if (typeof nuxtVersion === 'string') {
        return nuxtVersion.startsWith('2') ? true : false;
    }
};


export const updateNuxtConfig = (action: 'inject-eslint-devChcker' | 'add-module', input?: string) => {
    try {
        const nuxtConfigPath = findNuxtConfig();
        const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf8');

        const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
        const config =
            mod.exports.default.$type === 'function-call'
                ? mod.exports.default.$args[0]
                : mod.exports.default;

        if (action === 'inject-eslint-devChcker') {
            config.eslint ||= {};
            config.eslint.checker = true;
        }

        if (action === 'add-module') {
            const layer = isLayer(input);

            if (layer) {
                config.extends ||= [];
                if (!config.extends.includes(input)) {
                    config.extends.push(input);
                }
            } else {
                config.modules ||= [];
                if (!config.modules.includes(input)) {
                    config.modules.push(input);
                }
            }
        }


        const generated = mod.generate().code;
        writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf8');


    } catch {
        window.showErrorMessage(
            'Failed to update nuxt config.'
        );
    }
};
