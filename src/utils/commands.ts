import { hasServerDir } from "../utils";
import { nuxtrConfiguration } from '.'

const nuxtLang = nuxtrConfiguration().nuxtFiles.defaultLanguage

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
                extension: `.${nuxtLang}`,
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
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'middleware': {
            type = {
                name: 'Middleware',
                path: 'middleware',
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'plugins': {
            type = {
                name: 'Plugins',
                path: 'plugins',
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'api': {
            type = {
                name: 'APIs',
                path: `${await hasServerDir()}/api`,
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'route': {
            type = {
                name: 'Routes',
                path: `${await hasServerDir()}/routes`,
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'nitroPlugin': {
            type = {
                name: 'Plugins',
                path: `${await hasServerDir()}/plugins`,
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'nitroMiddleware': {
            type = {
                name: 'Middleware',
                path: `${await hasServerDir()}/middleware`,
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'nuxtUtil': {
            type = {
                name: 'Utilities',
                path: `utils`,
                extension: `.${nuxtLang}`,
            };
            break;
        }
        case 'nitroUtil': {
            type = {
                name: 'Utility',
                path: `${await hasServerDir()}/utils`,
                extension: `.${nuxtLang}`,
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

    return { type };

};
