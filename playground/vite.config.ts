import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The playground runs against the library source, so library changes need no rebuild.
    alias: {
      variantlab: fileURLToPath(new URL('../packages/variantlab/src/index.ts', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
});
