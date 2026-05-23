// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kojikawazu.github.io',
  base: '/my-github-index',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
