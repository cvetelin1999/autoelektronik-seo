import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://autoelektronik-seo.tsvetelin-takiev.workers.dev',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    format: 'directory',
  },
});
