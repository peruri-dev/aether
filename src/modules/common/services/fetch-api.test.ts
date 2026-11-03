import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchApi } from './fetch-api';
import { ApiError } from '../utils/error';

const jsonResponse = (body: unknown, status = 200): Response =>
  Response.json(body, { status });

describe('fetchApi', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('mengembalikan body JSON saat sukses dan tidak mengirim token', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { id: 1 }, message: '', code: 'OK' }),
    );

    const result = await fetchApi<{ id: number }>('/api/projects/1');

    expect(result.data).toEqual({ id: 1 });
    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(init?.credentials).toBe('same-origin');
    expect(init?.headers).not.toHaveProperty('Authorization');
  });

  it('melempar ApiError dengan pesan dari backend', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { data: { field: 'name' }, message: 'Nama wajib diisi', code: 'VAL' },
        422,
      ),
    );

    await expect(fetchApi('/api/projects')).rejects.toMatchObject({
      status: 422,
      code: 'VAL',
      message: 'Nama wajib diisi',
      data: { field: 'name' },
    });
  });

  it('memakai pesan default kalau backend tidak memberi pesan', async () => {
    fetchMock.mockResolvedValue(
      new Response('Internal Server Error', { status: 500 }),
    );

    const error = await fetchApi('/api/projects').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).message).toMatch(/server/i);
  });

  it('mengubah kegagalan jaringan menjadi ApiError status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchApi('/api/projects')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  it('mengembalikan Blob untuk respons non-JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('%PDF', { headers: { 'Content-Type': 'application/pdf' } }),
    );

    const result = await fetchApi<Blob>('/api/documents/1/file');

    expect(result.data.size).toBe(4);
    expect(await result.data.text()).toBe('%PDF');
  });
});
