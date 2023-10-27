import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

function getAssetFiles(rootDir, subDir) {
    const dirPath = path.join(rootDir, subDir);
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    return files.flatMap((file) => {
        const filePath = path.join(subDir, file.name);
        return file.isDirectory()
            ? getAssetFiles(rootDir, filePath)
            : filePath;
    });
}

const assetFiles = getAssetFiles(__dirname, 'assets');

export default defineConfig({
    // Configure asset inclusion
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                FirstYear: path.resolve(__dirname, 'levels/First-Year/First-Year.html'),
                SecondYear: path.resolve(__dirname, 'levels/Second-Year/Second-Year.html'),
                ThirdYear: path.resolve(__dirname, 'levels/Third-Year/Third-Year.html'),
            },
        },
        commonjsOptions: {
            include: [/linked-dep/, /node_modules/],
        },
        // Copy assets
        assets: {
            // Include all asset files
            include: assetFiles,
            // Source directory for your assets
            base: '/assets',
            // Output directory
            outputDir: '/assets',
        },
    },

    // Set the base URL to an empty string to generate relative URLs
    base: '/',

    // Create a Vite plugin to adjust HTML references
    plugins: [
        {
            name: 'adjust-html-references',
            transformIndexHtml(html) {
                // Modify HTML to use relative URLs without leading slash
                const modifiedHTML = html.replace(/<a href="\/(.*?)">/g, '<a href="$1">');
                return modifiedHTML;
            },
        },
    ],
});
