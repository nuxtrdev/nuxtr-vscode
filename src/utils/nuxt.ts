import { window } from 'vscode';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { parseModule } from 'magicast';
import { projectRootDirectory } from '.';


export const findNuxtConfig = (): string | undefined => {
    const names = ['nuxt.config.ts', 'nuxt.config.js'];

    for (const name of names) {
        const path = `${projectRootDirectory()}/${name}`;
        if (existsSync(path)) { return path; }
    }
};

export const isLayer = async (module: any) => {
    let modulePath = `${projectRootDirectory()}/node_modules/${module.npm}`;

    if (existsSync(modulePath)) {
        let nuxtConfigPath = `${modulePath}/nuxt.config.ts`;

        if (existsSync(nuxtConfigPath)) {
            return true;
        } else {
            return false;
        }
    }
};


export const addNuxtModule = async (module: any) => {
    try {
        const nuxtConfigPath = findNuxtConfig();
        const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf-8');

        const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
        const config =
            mod.exports.default.$type === 'function-call'
                ? mod.exports.default.$args[0]
                : mod.exports.default;

        let layer = await isLayer(module);

        if (layer) {
            config.extends ||= [];
            if (!config.extends.includes(module.npm)) {
                config.extends.push(module.npm);
            }
        } else {
            config.modules ||= [];
            if (!config.modules.includes(module.npm)) {
                config.modules.push(module.npm);
            }
        }

        const generated = mod.generate().code;
        writeFileSync(`${nuxtConfigPath}`, `${generated.trimEnd()}\n`, 'utf-8');
    } catch (error) {
        window.showErrorMessage(
            `${module.npm} failed to install, please install it manually, ${error}`
        );
    }
};

export const removeNuxtModule = async (module: any) => {
    try {
        const nuxtConfigPath = findNuxtConfig();
        const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf-8');

        const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
        const config =
            mod.exports.default.$type === 'function-call'
                ? mod.exports.default.$args[0]
                : mod.exports.default;

        let layer = await isLayer(module);

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
        writeFileSync(`${nuxtConfigPath}`, `${generated.trimEnd()}\n`, 'utf-8');
    } catch (error) {
        window.showErrorMessage(
            `${module} failed to uninstall, please uninstall it manually, ${error}`
        );
    }
};

export const isNuxtProject = async () => {
    return (await findNuxtConfig()) ? true : false;
};

export const getNuxtVersion = (): string | undefined => {
    let packageJsonPath = `${projectRootDirectory()}/package.json`;
    if (!existsSync(packageJsonPath)) {
        return;
    } else {
        let packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        let dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };
        if ('nuxt' in dependencies) {
            let nuxtVersion = dependencies['nuxt'];
            return nuxtVersion.replace('^', '');
        }
    }
};

export const hasSrcDir = (): string => {
    const nuxtConfigPath = findNuxtConfig();
    const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf-8');

    const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    return config.srcDir ? `/${config.srcDir}` : '/';
};


export const hasServerDir = (): string => {
    const nuxtConfigPath = findNuxtConfig();
    const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf-8');

    const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    return config.serverDir ? `${config.serverDir}` : 'server';
};

export const isNuxtTwo = (): boolean | undefined => {
    let nuxtVersion = getNuxtVersion();
    if (typeof nuxtVersion === 'string') {
        return nuxtVersion.startsWith('2') ? true : false;
    }
};

export const updateNuxtConfig = (update: (config: any) => void) => {
    try {
        const nuxtConfigPath = findNuxtConfig();
        const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf-8');

        const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
        const config =
            mod.exports.default.$type === 'function-call'
                ? mod.exports.default.$args[0]
                : mod.exports.default;

        update(config);

        const generated = mod.generate().code;
        writeFileSync(`${nuxtConfigPath}`, `${generated.trimEnd()}\n`, 'utf-8');
    } catch (error) {
        window.showErrorMessage(
            `Failed to update nuxt config, please update it manually, ${error}`
        );
    }
};
