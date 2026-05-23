// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kojikawazu.github.io',
  base: '/my-github-index',
  output: 'static',
  vite: {
    // @tailwindcss/vite の Plugin 型は Astro 同梱 Vite の型と微妙にズレるため any キャスト
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
