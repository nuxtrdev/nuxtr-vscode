/** Map command categories to configured application/server directories and file types. */
import { relative } from 'node:path';
import { projectDirectory } from './nuxt';
import { DirectoryKind } from '../core/directories';
import { scaffoldExtension } from './files';
import { hasServerDir } from '../utils';

/** Return the configured folder relative to appDir so existing scaffold callers share one path resolver. */
export const getCommandType = async (commandType: string) => {
    let type = {
        name: '',
        path: '',
        extension: '',
    };
    switch (commandType) {
        case 'components': {
            type = {
                name: 'Components',
                path: 'components',
                extension: '.vue',
            };
            break;
        }
        case 'composables': {
            type = {
                name: 'Composables',
                path: 'composables',
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'pages': {
            type = {
                name: 'Pages',
                path: 'pages',
                extension: '.vue',
            };
            break;
        }
        case 'layouts': {
            type = {
                name: 'Layouts',
                path: 'layouts',
                extension: '.vue',
            };
            break;
        }
        case 'store': {
            type = {
                name: 'Store',
                path: 'store',
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'middleware': {
            type = {
                name: 'Middleware',
                path: 'middleware',
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'plugins': {
            type = {
                name: 'Plugins',
                path: 'plugins',
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'api': {
            type = {
                name: 'APIs',
                path: `${await hasServerDir()}/api`,
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'route': {
            type = {
                name: 'Routes',
                path: `${await hasServerDir()}/routes`,
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'nitroPlugin': {
            type = {
                name: 'Plugins',
                path: `${await hasServerDir()}/plugins`,
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'nitroMiddleware': {
            type = {
                name: 'Middleware',
                path: `${await hasServerDir()}/middleware`,
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'nuxtUtil': {
            type = {
                name: 'Utilities',
                path: 'utils',
                extension: scaffoldExtension(),
            };
            break;
        }
        case 'nitroUtil': {
            type = {
                name: 'Utility',
                path: `${await hasServerDir()}/utils`,
                extension: scaffoldExtension(),
            };
            break;
        }
        default: {
            // show error message
            type = {
                name: '',
                path: '',
                extension: '',
            };
            break;
        }
    }

    const kind = commandType === 'nuxtUtil' ? 'utils' : commandType;
    if (['pages', 'layouts', 'components', 'composables', 'plugins', 'middleware', 'store', 'utils'].includes(kind)) {
        type.path = relative(projectDirectory('app'), projectDirectory(kind as DirectoryKind));
    }
    return { type };

};
