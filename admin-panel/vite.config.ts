import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('recharts')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('@supabase')) {
                            return 'vendor-supabase';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        return 'vendor';
                    }
                    // Split pages into separate chunks
                    if (id.includes('/pages/')) {
                        const pageName = id.split('/pages/')[1]?.split('.')[0];
                        if (pageName) {
                            return `page-${pageName.toLowerCase()}`;
                        }
                    }
                },
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', '@supabase/supabase-js', 'recharts'],
    },
})
