import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/cli/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'dist/cli',
    target: 'node20',
    minify: false,
    // Ensure that external native modules or dependencies like nut.js are handled correctly
    external: [
        '@computer-use/nut-js',
        '@computer-use/mac-screen-capture-permissions',
        'screenshot-desktop',
        'clipboardy'
    ]
});
