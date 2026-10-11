/** Keep Tailwind package, CSS and Nuxt configuration generations aligned for explicit scaffold recipes. */
import { builders } from 'magicast';
import { configModule, editModuleConfig, hasConfiguredModule } from './modules';
export type TailwindRecipe = 'vite4' | 'module3';

/** Return packages and CSS that match the selected Vite 4 or legacy module 3 integration. */
export function tailwindRecipe (recipe: TailwindRecipe) {
    return recipe === 'vite4'
        ? { packages: ['tailwindcss@^4', '@tailwindcss/vite@^4'], css: '/* Tailwind 4 utilities, compiled by the Vite plugin. */\n@import "tailwindcss";\n' }
        : { packages: ['tailwindcss@^3', '@nuxtjs/tailwindcss@^6.14.0'], css: '/* Legacy Tailwind 3 utilities, compiled by the Nuxt module. */\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' };
}

/** Configure one integration idempotently, preserving comments and avoiding combined Tailwind 3/4 plugins. */
export function configureTailwindSource (source: string, recipe: TailwindRecipe, cssAlias: string): string {
    if (recipe === 'vite4' && hasConfiguredModule(source, '@nuxtjs/tailwindcss')) { throw new Error('Remove the legacy @nuxtjs/tailwindcss module before choosing Tailwind 4/Vite.'); }
    const { module, config } = configModule(recipe === 'module3' ? editModuleConfig(source, '@nuxtjs/tailwindcss', 'add') : source);
    if (recipe === 'module3') {
        if (module.imports.$items.some(item => item.from === '@tailwindcss/vite')) { throw new Error('Remove the Tailwind 4 Vite integration before choosing the legacy module.'); }
        config.tailwindcss ||= {};
        config.tailwindcss.cssPath = cssAlias;
    } else {
        const imported = module.imports.$items.find(item => item.from === '@tailwindcss/vite' && item.imported === 'default');
        const local = imported?.local || 'nuxtrTailwindcss';
        if (!imported) { module.imports.$append({ from: '@tailwindcss/vite', imported: 'default', local }); }
        config.vite ||= {};
        config.vite.plugins ||= [];
        if (!Array.isArray(config.vite.plugins)) { throw new TypeError('vite.plugins is computed. Add the Tailwind plugin manually.'); }
        let exists = false;
        for (let index = 0; index < config.vite.plugins.length; index++) { if (config.vite.plugins[index]?.$callee === local) { exists = true; } }
        if (!exists) { config.vite.plugins.push(builders.functionCall(local)); }
        config.css ||= [];
        if (!Array.isArray(config.css)) { throw new TypeError('css is computed. Add the Tailwind stylesheet manually.'); }
        if (!config.css.includes(cssAlias)) { config.css.push(cssAlias); }
    }
    const result = module.generate().code;
    return result.trimEnd() + '\n';
}
