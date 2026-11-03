import { describe, expect, it } from 'vitest';

import { ApiError, isApiError, RedirectError } from './error';

describe('ApiError', () => {
  it('menyimpan status, code, pesan, dan data', () => {
    const error = new ApiError(422, 'VALIDATION', 'Data tidak valid', {
      field: 'email',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(422);
    expect(error.code).toBe('VALIDATION');
    expect(error.message).toBe('Data tidak valid');
    expect(error.data).toEqual({ field: 'email' });
    expect(isApiError(error)).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});

describe('RedirectError', () => {
  it('default status 302', () => {
    const error = new RedirectError('/login');
    expect(error.path).toBe('/login');
    expect(error.status).toBe(302);
  });
});
