import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Active le nouveau JSX runtime (pas besoin d'importer React)
      jsxRuntime: 'automatic'
    })
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});

