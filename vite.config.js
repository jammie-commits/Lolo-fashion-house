import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['dry-maps-sell.loca.lt'],
  },
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'collections.html',
        'gowns.html',
        'african-prints.html',
        'gallery.html',
        'how-to-order.html',
        'about.html',
        'contact.html',
        'cart.html',
      ],
    },
  },
});