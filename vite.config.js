import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        https: false,
        host: 'localhost',
        port: 5173,
        cors: true,
        proxy: {
            // Forward all requests not matching static assets to Laravel
            '^(?!/@vite|/resources|/node_modules|/@react-refresh).*': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});
