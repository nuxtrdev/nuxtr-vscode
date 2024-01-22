import { window, workspace, Uri } from 'vscode';
import { writeFileSync, readFileSync, existsSync, promises, readdir } from 'fs';
import { join } from 'pathe';
import { parseModule } from 'magicast';
import { readTSConfig } from 'pkg-types'
import { trimEnd } from 'string-ts';
import { projectRootDirectory, projectSrcDirectory } from '.';
import { pathExistsSync } from 'fs-extra';
import { TsconfigPaths } from '../types';

export const findNuxtConfig = (): string | undefined => {
    const names = ['nuxt.config.ts', 'nuxt.config.js'];

    for (const name of names) {
        const path = `${projectRootDirectory()}/${name}`;
        if (existsSync(path)) { return path; }
    }
};

const isLayer = async (module: any) => {
    let modulePath = `${projectRootDirectory()}/node_modules/${module.npm}`;

    if (existsSync(modulePath)) {
        let nuxtConfigPath = `${modulePath}/nuxt.config.ts`;
        const result = pathExistsSync(nuxtConfigPath)
        console.log('result', result);


        if (result !== undefined) {
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
        writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf-8');
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
        writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf-8');
    } catch (error) {
        window.showErrorMessage(
            `${module} failed to uninstall, please uninstall it manually, ${error}`
        );
    }
};

export const isNuxtProject = async () => {
    const names = ['nuxt.config.ts', 'nuxt.config.js'];

    for (const name of names) {
        const path = `${projectRootDirectory()}/${name}`;
        const result = pathExistsSync(path);
        if (result) { return true } else { continue }
    }

    return false;
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

export const hasSrcDir = async (): Promise<string> => {
    const isNuxt = await isNuxtProject();
    if (!isNuxt) {
        return '/'
    }
    const nuxtConfigPath = findNuxtConfig();
    const nuxtConfig = readFileSync(`${nuxtConfigPath}`, 'utf-8');

    const mod = parseModule(nuxtConfig, { sourceFileName: nuxtConfigPath });
    const config =
        mod.exports.default.$type === 'function-call'
            ? mod.exports.default.$args[0]
            : mod.exports.default;

    return config.srcDir ? `/${config.srcDir}` : '/';
};


const fetchNuxtAlias = async () => {
    const path = `${projectRootDirectory()}/.nuxt/tsconfig.json`;

    if (!existsSync(path)) {
        return {};
    }

    try {
        let tsconfig = await readTSConfig(path);

        if (tsconfig) {
            const paths = tsconfig.compilerOptions?.paths;
            let parsedPaths = parseTsconfigPaths(paths);
            return parsedPaths;
        }

    } catch (error) {
        console.error('Error fetching Nuxt alias:', error);
    }
};


export const hasServerDir = async (): Promise<string> => {
    const isNuxt = await isNuxtProject();
    if (!isNuxt) {
        return 'server'
    }
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

const updateNuxtConfig = (update: (config: any) => void) => {
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
        writeFileSync(`${nuxtConfigPath}`, `${trimEnd(generated)}\n`, 'utf-8');
    } catch (error) {
        window.showErrorMessage(
            `Failed to update nuxt config, please update it manually, ${error}`
        );
    }
};


const scanNuxtDirectories = async () => {
    let projectSrcDir = `${await projectSrcDirectory()}`;
    let nuxtDirectories = ['layouts', 'pages', 'components', 'composables', 'middleware'];
    let existingDirectories: string[] = [];

    if (existsSync(projectSrcDir)) {
        try {
            const srcDirContents = await promises.readdir(projectSrcDir);

            for (const directory of nuxtDirectories) {
                if (srcDirContents.includes(directory)) {
                    existingDirectories.push(directory);
                }
            }
        } catch (error) {
            console.error('Error scanning Nuxt directories:', error);
        }

    }
    return existingDirectories;
}

async function scanFilesAndSubdirectories(directoryPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        readdir(directoryPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err);
            } else {
                const fileAndDirNames: string[] = [];
                files.forEach((file: any) => {
                    const fullPath = join(directoryPath, file.name);
                    fileAndDirNames.push(fullPath);
                    if (file.isDirectory()) {
                        scanFilesAndSubdirectories(fullPath).then((subFiles) => {
                            fileAndDirNames.push(...subFiles);
                            if (fileAndDirNames.length === files.length) {
                                resolve(fileAndDirNames);
                            }
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        if (fileAndDirNames.length === files.length) {
                            resolve(fileAndDirNames);
                        }
                    }
                });
            }
        });
    });
}

function parseTsconfigPaths(tsconfigPaths: TsconfigPaths): {} {
    const parsedTsconfigPaths: TsconfigPaths = {};

    for (const key in tsconfigPaths) {
        if (!key.startsWith('#')) {
            const values = tsconfigPaths[key].filter(value => !value.startsWith('#'));

            const normalizedKey = key.replace(/(\/\*)?$/, '');

            const processedValues = values.map(value => {
                if (value === '..' || value === '../') {
                    value = './';
                } else if (value.startsWith('../')) {
                    value = `./${value.slice(3)}`;
                }

                return value.endsWith('/*') ? value.replace('/*', '') : value;
            });

            parsedTsconfigPaths[normalizedKey] = [processedValues[0]];
        }
    }

    return parsedTsconfigPaths;
}