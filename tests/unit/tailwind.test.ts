/** Tailwind recipe regressions ensure package generations, CSS directives and Nuxt configuration agree (#179). */
import { expect, it } from 'vitest';
import { configureTailwindSource, tailwindRecipe } from '../../src/core/tailwind';
it('pairs Tailwind 4 with the Vite plugin and CSS import', () => {
    const recipe = tailwindRecipe('vite4');
    expect(recipe.packages).toContain('tailwindcss@^4'); expect(recipe.packages).toContain('@tailwindcss/vite@^4');
    expect(recipe.css).toContain('@import "tailwindcss"');
    const source = configureTailwindSource('// Keep me\nexport default defineNuxtConfig({ css: ["~/existing.css"] })', 'vite4', '~/assets/css/tailwind.css');
    expect(source).toContain('// Keep me'); expect(source).toContain('@tailwindcss/vite'); expect(source).toContain('~/existing.css');
    expect(configureTailwindSource(source, 'vite4', '~/assets/css/tailwind.css')).toBe(source);
});
it('pairs the legacy module with Tailwind 3 and refuses mixed generations', () => {
    expect(tailwindRecipe('module3').packages).toContain('tailwindcss@^3');
    expect(tailwindRecipe('module3').css).toContain('@tailwind utilities');
    const source = configureTailwindSource('export default defineNuxtConfig({})', 'module3', '~/assets/css/tailwind.css');
    expect(source).toContain('@nuxtjs/tailwindcss');
    expect(() => configureTailwindSource(source, 'vite4', '~/assets/css/tailwind.css')).toThrow(/legacy/);
});
