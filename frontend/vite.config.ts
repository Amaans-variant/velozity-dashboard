import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// standard vite react setup, nothing fancy going on here
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
