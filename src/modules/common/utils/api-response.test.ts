import { describe, expect, it } from 'vitest';

import { dataResponse, errorResponse } from './api-response';

describe('dataResponse', () => {
  it('membungkus data dengan kontrak BackendResponse', async () => {
    const response = dataResponse({
      data: { id: 1 },
      code: 'OK',
      requestId: 'req-1',
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({
      data: { id: 1 },
      message: '',
      code: 'OK',
      requestId: 'req-1',
    });
  });
});

describe('errorResponse', () => {
  it('default status 500 dengan data kosong', async () => {
    const response = errorResponse();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      data: {},
      message: '',
      code: '',
      requestId: '',
    });
  });
});
