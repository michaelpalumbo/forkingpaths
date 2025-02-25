import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import path from 'path';


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
    outDir: path.resolve(__dirname, 'dist'), // Ensures dist is created inside the project folder
    emptyOutDir: true, // Ensures the folder is cleared before each build
    rollupOptions: {
      input: './public/index.html',
    },
  },
});