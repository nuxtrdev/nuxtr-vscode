/** Bundle the Vue sidebar and Tailwind 4 CSS with stable packaged asset names. */
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    build: {
        outDir: '../../out/sidebar',
        emptyOutDir: true,
        cssMinify: 'lightningcss',
        minify: 'terser',
        rolldownOptions: {
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    }
});
