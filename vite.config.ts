/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import jsonSplitPlugin from "./vite-plugin-split.mjs";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    // modified import('vitest/dist/config.js').defaultInclude
    include: '**/*.{e2e,spec}.?(c|m)[jt]s?(x)',
  },
  // define: {
  //   CHAIN: JSON.stringify([
  //     {
  //       name: 'Agoric',
  //       networks: ['mainnet'],
  //     },
  //   ]),
  // },
  server: {
    hmr: true,
  },
});
