import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  // Any custom configurations here
  plugins: [wasm()],
});