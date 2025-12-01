import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';
  
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
    // Remove console.log in production
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      // Disable source maps in production for smaller builds
      sourcemap: false,
      // Use esbuild for minification (built-in, faster)
      minify: 'esbuild',
      // Target modern browsers for smaller bundle
      target: 'es2020',
      rollupOptions: {
        output: {
          // Optimize chunk names for caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: (id) => {
            // Core vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'vendor-maps';
              }
              if (id.includes('@capacitor')) {
                return 'vendor-capacitor';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('@sentry')) {
                return 'vendor-sentry';
              }
              // Other vendor modules
              return 'vendor';
            }
            // Split views into separate chunks
            if (id.includes('/components/views/')) {
              const viewName = id.split('/components/views/')[1]?.split('.')[0];
              if (viewName && viewName !== 'index' && viewName !== 'lazy') {
                return `view-${viewName.toLowerCase()}`;
              }
            }
          },
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js'],
    },
  };
});
