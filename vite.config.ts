import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 1000, // Increase limit to silence warning
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            maps: ['leaflet', 'react-leaflet'],
            utils: ['@capacitor/core', '@capacitor/app', '@capacitor/camera']
          }
        }
      }
    }
  };
});
