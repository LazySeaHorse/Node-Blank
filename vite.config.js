import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        preact(),
        tailwindcss(),
        visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
            filename: "stats.html"
        })
    ],
    server: {
        port: 3000,
        open: true
    },
    resolve: {
        alias: {
            '@': '/src',
            '@state': '/state',
            '@utils': '/utils'
        },
    },
});
