import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyPath = env.VITE_API_PROXY_PATH || '/api';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT) || 5175,
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
