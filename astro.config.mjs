import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwindcss(),
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    resolve: {
      alias: {
        '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
        '@db': fileURLToPath(new URL('./src/lib/db', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      },
    },
  },
});
