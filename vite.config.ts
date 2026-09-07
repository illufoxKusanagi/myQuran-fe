import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  server: {
    host: true, // Needed for Docker and cloud preview to expose outside the container
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
