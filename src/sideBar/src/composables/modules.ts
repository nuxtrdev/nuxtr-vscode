/** Expose the validated bundled catalogue for immediate, offline sidebar rendering. */
import content from '../../../content/modules.json';
import { CatalogueModule, normalizeCatalogue } from '../../../core/catalogue';
export type Module = CatalogueModule;
/** Load module metadata without network requests from the webview. */
export function useModules (): Module[] { return normalizeCatalogue(content); }
