import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    base: './',
    build: {
        outDir: resolve(__dirname, 'dist'),
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
            },
            output: {
                entryFileNames: 'script.[hash].js',
                chunkFileNames: 'chunk.[hash].js',
                assetFileNames: '[name].[hash].[ext]',
            },
        },
        minify: 'esbuild',
    },
    css: {
        postcss: {
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
});
