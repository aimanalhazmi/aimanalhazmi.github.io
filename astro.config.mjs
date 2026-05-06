import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare'; // This line is crucial
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://aimanalhazmi.github.io',
  // 1. Change output to 'hybrid'
  // (Static for your blog, Server for your API)
  output: 'hybrid',

  // 2. Add the adapter here
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  },
});