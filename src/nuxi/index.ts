import { window } from 'vscode'
import { tryImport, isNuxiInstalled, newTerminal } from '../utils'

export async function tryImportNuxi() {
    return (await tryImport('nuxi') || await tryImport('nuxi-edge')) as undefined | typeof import('nuxi-edge')
}
