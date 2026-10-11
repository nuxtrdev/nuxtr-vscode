/** Collect exact project/application/server paths for resource-aware Explorer menu visibility. */
import type { NuxtDirectories } from './directories';
import type { ProjectContext } from './project';

export interface ExplorerFolders {
    projectRoots: string[];
    applicationDirectories: string[];
    serverDirectories: string[];
}

/** Include every discovered project; omit unresolved layouts so menu actions never imply guessed destinations. */
export function explorerFolders (projects: readonly ProjectContext[], layout: (project: ProjectContext) => NuxtDirectories): ExplorerFolders {
    const folders: ExplorerFolders = { projectRoots: projects.map(project => project.root), applicationDirectories: [], serverDirectories: [] };
    for (const project of projects) {
        try {
            const directories = layout(project);
            folders.applicationDirectories.push(directories.app);
            folders.serverDirectories.push(directories.server);
        } catch { /* Root actions remain available; directory-specific actions require a safely resolved layout. */ }
    }
    return Object.fromEntries(Object.entries(folders).map(([key, paths]) => [key, [...new Set(paths)]])) as unknown as ExplorerFolders;
}
