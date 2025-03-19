import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import wasm from 'vite-plugin-wasm';
import path from 'path';


export default defineConfig({
  root: ".", // Set the root directory
  publicDir: "public", // Ensure 'public' is used as the directory for static assets
  base: './', // Ensures relative paths work in Render & local build

  
  // Any custom configurations here
  plugins: [
    wasm(),
    // use this to copy the README.md file to the public dir during build. 
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'README.md'),
          dest: '.'  // Copies README.md to the root of dist
        }
      ]
    })
  ],
  define: {
    'window.TONE_SILENCE_LOGGING': true,
  },
  assetsInclude: ['./README.md'],
  
  build: {
    target: 'esnext',
    outDir: path.resolve(__dirname, 'dist'), // Ensures dist is created inside the project folder
    emptyOutDir: true, // Ensures the folder is cleared before each build
    rollupOptions: {
      // input: './index.html',
      input: {
        main: path.resolve(__dirname, 'index.html'),
        synthApp: path.resolve(__dirname, 'synthApp.html'),
        patchHistory: path.resolve(__dirname, 'patchHistory.html'),
        synthDesigner: path.resolve(__dirname, 'synthDesigner.html'),
        // README: path.resolve(__dirname, 'README.md'),
      },
    },
    
    
    // manualChunks: {
    //   "script": ["./src/scripts/script.js"]
    // }
  },
});