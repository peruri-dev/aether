import { envField } from 'astro/config';

export const envSchema = {
  NODE_ENV: envField.enum({
    context: 'server',
    access: 'public',
    values: ['development', 'staging', 'production'],
    default: 'development',
  }),
  API_BASE_URL: envField.string({ context: 'server', access: 'secret' }),
};
