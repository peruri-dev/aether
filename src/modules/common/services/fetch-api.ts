import {
  AUTH_REDIRECT_REASONS,
  buildLoginUrl,
} from '../auth/route-permissions';
import { ApiError } from '../utils/error';
import { text } from '../utils/i18n';

import type { BackendResponse } from '../utils/api-response';

/**
 * Pemanggil BFF dari browser (CONVENTIONS [E1], [E2]).
 *
 * - Hanya untuk path relatif `/api/...` di origin yang sama. Token ada di cookie httpOnly
 *   dan ditempelkan oleh endpoint BFF, jadi fungsi ini tidak pernah menyentuh token.
 * - Refresh token juga urusan BFF. Kalau BFF tetap menjawab 401, sesi memang habis:
 *   user diarahkan ke login dengan returnTo.
 * - Respons non-JSON (PDF, file) dikembalikan sebagai Blob di `data`.
 */
export async function fetchApi<T>(
  path: `/api/${string}`,
  options: RequestInit = {},
): Promise<BackendResponse<T>> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new ApiError(0, 'OFFLINE', messages.offline());
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...normalizeHeaders(options.headers),
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', messages.offline());
  }

  if (response.status === 401) {
    redirectToLogin();
    // Halaman sedang berpindah; jangan biarkan pemanggil melanjutkan alurnya.
    return new Promise<never>(() => {});
  }

  const isJson = (response.headers.get('content-type') ?? '').includes(
    'application/json',
  );

  if (!response.ok) {
    const body = isJson ? await safeJson<T>(response) : null;
    throw new ApiError(
      response.status,
      body?.code ?? '',
      body?.message || messageForStatus(response.status),
      body?.data,
    );
  }

  if (!isJson) {
    return { data: (await response.blob()) as T, message: '', code: '' };
  }

  const body = await safeJson<T>(response);
  if (!body)
    throw new ApiError(response.status, 'INVALID_RESPONSE', messages.server());
  return body;
}

function redirectToLogin(): void {
  const { pathname, search } = globalThis.location;
  globalThis.location.assign(
    buildLoginUrl(pathname + search, AUTH_REDIRECT_REASONS.sessionExpired),
  );
}

async function safeJson<T>(
  response: Response,
): Promise<BackendResponse<T> | null> {
  try {
    return (await response.json()) as BackendResponse<T>;
  } catch {
    return null;
  }
}

function normalizeHeaders(
  headers: HeadersInit | undefined,
): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

const messages = {
  offline: (): string =>
    text(
      'Koneksi terputus, silakan coba lagi.',
      'Connection lost, please try again.',
    ),
  badRequest: (): string =>
    text(
      'Terdapat kesalahan pada permintaan.',
      'There is an issue with the request.',
    ),
  forbidden: (): string =>
    text(
      'Anda tidak memiliki izin untuk mengakses bagian ini.',
      'You do not have permission to access this part.',
    ),
  notFound: (): string => text('Data tidak ditemukan.', 'Data not found.'),
  server: (): string =>
    text(
      'Terjadi kesalahan pada server, silakan coba lagi nanti.',
      'A server error occurred. Please try again later.',
    ),
};

function messageForStatus(status: number): string {
  if (status === 403) return messages.forbidden();
  if (status === 404) return messages.notFound();
  if (status >= 500) return messages.server();
  return messages.badRequest();
}
