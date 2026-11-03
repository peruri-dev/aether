import { envField } from 'astro/config';

export const envSchema = {
  API_BASE_URL: envField.string({ context: 'server', access: 'secret' }),
  API_VERSION: envField.string({
    context: 'server',
    access: 'secret',
    default: 'v1',
  }),
  API_KEY: envField.string({
    context: 'server',
    access: 'secret',
    optional: true,
  }),
  API_TIMEOUT_MS: envField.number({
    context: 'server',
    access: 'secret',
    default: 15000,
  }),
  AUTH_STRATEGY: envField.enum({
    context: 'server',
    access: 'secret',
    values: ['jwt', 'mock'],
    default: 'jwt',
  }),
  AUTH_JWKS_URL: envField.string({
    context: 'server',
    access: 'secret',
    optional: true,
  }),
  PUBLIC_BRAND: envField.enum({
    context: 'client',
    access: 'public',
    values: ['neutral', 'bgn', 'bkn', 'inagov', 'lan', 'panrb'],
    default: 'neutral',
  }),
  PUBLIC_APP_NAME: envField.string({
    context: 'client',
    access: 'public',
    default: 'Dashboard',
  }),
};
