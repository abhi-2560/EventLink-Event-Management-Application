import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyPath = env.VITE_API_PROXY_PATH || '/api';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@registrant': path.resolve(__dirname, 'src/registrant'),
        '@organizer': path.resolve(__dirname, 'src/organizer'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT) || 5173,
      proxy: {
        [proxyPath]: {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000',
          changeOrigin: true,
          rewrite: (path) => path.startsWith(proxyPath) ? path.slice(proxyPath.length) || '/' : path,
        },
      },
    },
  };
});
