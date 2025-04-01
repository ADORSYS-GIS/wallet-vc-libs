// vitest.config.js
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [wasm()],
  test: {
    globals: true,
    setupFiles: ['vitest.setup.ts'],
    silent: true,
    deps: {
      inline: ['didcomm'],
    },
  },
  optimizeDeps: {
    include: ['didcomm'],
  },
});
