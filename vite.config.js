import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  root: ".", // Set the root directory
  publicDir: "public", // Ensure 'public' is used as the directory for static assets

  
  // Any custom configurations here
  plugins: [wasm()],
  define: {
    'window.TONE_SILENCE_LOGGING': true,
  },
  build: {
    target: 'esnext',
  },
});