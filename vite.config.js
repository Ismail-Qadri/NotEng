import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // base: "/notifications-ui/,
  base: "/",   
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      path: 'path-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'path-browserify', 'util', 'crypto-browserify', 'stream-browserify'],
  },
});



// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   base: process.env.NODE_ENV === "production" ? "/notifications-ui/" : "/",   // ← FIX
//   plugins: [react()],
//   resolve: {
//     alias: {
//       buffer: 'buffer',
//       process: 'process/browser',
//       path: 'path-browserify',
//       util: 'util',
//       crypto: 'crypto-browserify',
//       stream: 'stream-browserify',
//     },
//   },
//   define: {
//     global: 'globalThis',
//     'process.env': {},
//   },
//   optimizeDeps: {
//     include: ['buffer', 'process', 'path-browserify', 'util', 'crypto-browserify', 'stream-browserify'],
//   },
// });
