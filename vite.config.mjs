import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'fraser-motor-producers-especially.trycloudflare.com'
    ]
  }
});
