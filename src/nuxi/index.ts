import { tryImport } from '../utils';

export async function tryImportNuxi () {
    return ((await tryImport('nuxi')) || (await tryImport('nuxi-nightly'))) as undefined | typeof import('nuxi-nightly');
}
