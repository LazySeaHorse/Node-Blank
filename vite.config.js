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
            '@state': '/src/state',
            '@utils': '/src/utils',
            '@nodes': '/src/nodes'
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['preact/hooks', 'preact'],
                    'vendor-math': ['mathlive', 'katex', 'mathjs'],
                    'vendor-graph': ['d3', 'function-plot'],
                    'vendor-sheet': ['jspreadsheet-ce', 'jsuites'],
                }
            }
        }
    }
});
