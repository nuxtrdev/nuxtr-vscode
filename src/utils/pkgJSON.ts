
import { readPackageJSON, writePackageJSON } from 'pkg-types'
import { projectRootDirectory } from './'

export const injectPkgJSONScript = async (scriptName: string, script: string) => {
    const packageJsonPath = `${projectRootDirectory()}/package.json`
    const packageJson = await readPackageJSON(packageJsonPath)
    if (packageJson && packageJson.scripts && !packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = script
        await writePackageJSON(packageJsonPath, packageJson)
    }
}
