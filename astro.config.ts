import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/lib/site';

export default defineConfig({
  output: 'static',
  site: site.url,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
