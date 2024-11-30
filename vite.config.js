import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  // Any custom configurations here
  plugins: [wasm()],
  define: {
    'window.TONE_SILENCE_LOGGING': true,
  },
});