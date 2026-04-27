import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const prefixSelector = require('postcss-prefix-selector');

const SCOPE = '.pm-gantt';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react/jsx-runtime': path.resolve(__dirname, './src/amis-jsx-shim.ts'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './src/amis-jsx-shim.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
  },
  build: {
    outDir: 'dist/amis-renderer',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/amis-entry.ts'),
      name: 'PmGantt',
      formats: ['iife'],
      fileName: () => 'amis-renderer.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd'],
      output: {
        globals: {
          react: 'amisRequire("react")',
          'react-dom': 'amisRequire("react-dom")',
          antd: 'antd',
        },
        assetFileNames: 'amis-renderer.[ext]',
      },
    },
    assetsInlineLimit: 8192,
    cssCodeSplit: false,
    minify: 'terser',
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        prefixSelector({
          prefix: SCOPE,
          transform(prefix: string, selector: string, prefixedSelector: string, _filePath: string, rule: any) {
            if (selector === ':root') return selector;
            if (/^(html|body)(\s|,|$)/.test(selector)) return selector;
            const parent = rule.parent;
            if (parent?.type === 'atrule' && /^keyframes/.test(parent.name)) return selector;
            return prefixedSelector;
          },
        }),
      ],
    },
  },
});
