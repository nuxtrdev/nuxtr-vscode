import {
    addDependency,
    addDevDependency,
    detectPackageManager as detectPkgManager,
    ensureDependencyInstalled,
    removeDependency,
    installDependencies,
    DetectPackageManagerOptions,
    OperationOptions,
    PackageManager
} from 'nypm'

import { resolvePackageJSON, readPackageJSON, writePackageJSON, PackageJson } from 'pkg-types'
import destr from 'destr'
import { ofetch } from 'ofetch'

import { newTerminal, nuxtrConfiguration, projectRootDirectory, runCommand } from './global'
import { Dependency, OutdatedDependency } from '../types'

const parseDependencies = (depObj: Record<string, string>): Dependency[] => {
    return Object.keys(depObj).map((key) => ({
        name: key,
        version: depObj[key].replace(/[\^~]/, ''),
    }));
};

// TODO: get project dependencies from package.json
export const getProjectDependencies = async (): Promise<Dependency[]> => {
    const pkgJson: PackageJson = await readPackageJSON(projectRootDirectory());

    const dependencies: Dependency[] = [
        ...(pkgJson?.dependencies ? parseDependencies(pkgJson.dependencies) : []),
        ...(pkgJson?.devDependencies ? parseDependencies(pkgJson.devDependencies) : []),
    ];

    return dependencies;
};


// TODO: get outdated dependencies from package.json
export const getOutdatedDependencies = async (): Promise<OutdatedDependency[]> => {
    const dependencies: Dependency[] = await getProjectDependencies();

    const latestVersionPromises = dependencies.map(async (dependency) => {
        const res = await ofetch(`https://registry.npmjs.org/${dependency.name}`);

        const latestVersion = res['dist-tags'].latest;

        if (latestVersion !== dependency.version && dependency !== undefined) {
            return { ...dependency, latest: latestVersion, };
        }
    });

    const outdatedDependencies = await Promise.all(latestVersionPromises)
        .then((values) => values.filter((value) => value !== undefined)) as OutdatedDependency[];

    return outdatedDependencies;
}


// TODO: get project scripts from package.json
export const getProjectScripts = async () => {
    const pkgJson: PackageJson = await readPackageJSON(projectRootDirectory());
    const scripts: Record<string, string> = pkgJson?.scripts ?? {};
    return scripts;
};


// TODO: are dependencies installed?
export const areDependenciesInstalled = async () => {
    const dependencies: Dependency[] = await getProjectDependencies();

    const installedDependencies = dependencies.map(async (dependency) =>
        await ensureDependencyInstalled(dependency.name, { cwd: `${projectRootDirectory()}` }));

    const areInstalled = await Promise.all(installedDependencies)
        .then((values) => values.every((value) => value === true));

    return areInstalled;
};


// TODO: detect package manager
export const detectPackageManager = async (): Promise<PackageManager | undefined> => {
    try {
        const pm = await detectPkgManager(`${projectRootDirectory()}`) as PackageManager;
        return pm;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

// TODO: install dependencies
export const installProjectDependencies = async () => {
    const options: OperationOptions = {
        cwd: `${projectRootDirectory()}`,
        dev: true,
    };

    try {
        await installDependencies(options);
    } catch (error) {
        throw error;
    }
}

// TODO: update dependency
// TODO: remove dependency
// TODO: Get installation commands
// TODO: quick open handler for dependencies update
