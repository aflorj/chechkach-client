import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 9031,
    proxy: {
      '/api/': {
        target: 'http://localhost:9444',
        changeOrigin: true,
        secure: false,
        followRedirects: true,
      },
    },
  },
});
