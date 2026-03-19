import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@cli': resolve(__dirname, '../cli/src'),
      'node:fs': resolve(__dirname, 'src/shims/fs.ts'),
    },
  },
});
