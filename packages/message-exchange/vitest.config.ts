import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [wasm()],
  test: {
    setupFiles: ['vitest.setup.ts'],
    server: {
      deps: {
        inline: [/\.wasm$/],
      },
    },
  },
});
