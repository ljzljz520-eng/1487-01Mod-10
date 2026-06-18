import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      insertTypesEntry: true,
      entryRoot: 'src',
      exclude: ['**/__tests__/**', '**/*.test.tsx', '**/*.test.ts'],
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'components/Button/index': resolve(__dirname, 'src/components/Button/index.ts'),
        'icons/index': resolve(__dirname, 'src/icons/index.ts'),
      },
      name: 'SolidWebComponentsUI',
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `index.${format}.js`;
        }
        return `${entryName.replace('/index', '')}.${format}.js`;
      },
    },
    rollupOptions: {
      external: ['solid-js'],
      output: {
        globals: {
          'solid-js': 'Solid',
        },
        chunkFileNames: 'shared/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          title: 'Solid Web Components UI - Bundle Analysis',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          sourcemap: false,
        }),
      ],
    },
    cssCodeSplit: true,
    sourcemap: false,
    emptyOutDir: true,
  },
});
