/**
 * Error dari pemanggilan API (BFF atau backend).
 * - status 0 berarti tidak ada respons (offline atau jaringan gagal).
 */
export class ApiError<TData = unknown> extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly data?: TData,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Dilempar oleh kode server ketika halaman harus dialihkan.
 * Ditangkap di frontmatter .astro lalu diubah menjadi Astro.redirect (CONVENTIONS [G1]).
 */
export class RedirectError extends Error {
  constructor(
    public readonly path: string,
    public readonly status: 301 | 302 | 303 | 307 | 308 = 302,
  ) {
    super(`Redirect to ${path}`);
    this.name = 'RedirectError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
