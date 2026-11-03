import { envField } from 'astro/config';

export const envSchema = {
  NODE_ENV: envField.enum({
    context: 'server',
    access: 'public',
    values: ['development', 'staging', 'production'],
    default: 'development',
  }),
  API_BASE_URL: envField.string({ context: 'server', access: 'secret' }),
  PUBLIC_BRAND: envField.enum({
    context: 'client',
    access: 'public',
    values: ['neutral', 'bgn', 'bkn', 'inagov', 'lan', 'panrb'],
    default: 'neutral',
  }),
};
