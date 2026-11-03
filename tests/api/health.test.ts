import { describe, expect, it } from 'vitest';

import { GET } from '@/pages/api/health/index';

type Context = Parameters<typeof GET>[0];

describe('GET /api/health', () => {
  it('mengembalikan status ok sebagai JSON', async () => {
    const response = await GET({} as Context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
