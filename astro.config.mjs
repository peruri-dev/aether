// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import node from '@astrojs/node';
import { envSchema } from '@/env.schema';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  env: {
    schema: envSchema,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
