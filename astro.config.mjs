// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: "https://jirkasindelar.netlify.app",
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), preact()]
});