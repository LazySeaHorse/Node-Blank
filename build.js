import { cpSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create dist directory
mkdirSync('dist', { recursive: true });
mkdirSync('dist/styles', { recursive: true });

console.log('📦 Copying files to dist/...');

// Copy index.html
cpSync('index.html', 'dist/index.html');
console.log('✓ Copied index.html');

// Copy app.js
cpSync('app.js', 'dist/app.js');
console.log('✓ Copied app.js');

// Copy directories
const folders = ['lib', 'assets', 'components', 'utils', 'state', 'styles'];

folders.forEach(folder => {
    try {
        cpSync(folder, `dist/${folder}`, { recursive: true });
        console.log(`✓ Copied ${folder}/`);
    } catch (err) {
        console.warn(`⚠ Skipped ${folder}/ (not found or error)`);
    }
});

console.log('✅ Build complete! Output in dist/');
