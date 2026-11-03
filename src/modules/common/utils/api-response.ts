/**
 * Kontrak respons seragam antara BFF (src/pages/api) dan browser (CONVENTIONS [E3]).
 * Bentuk ini mengikuti backend perusahaan; kalau backend project lain berbeda,
 * petakan di endpoint BFF supaya browser tetap menerima bentuk yang sama.
 */
export interface BackendResponse<T = unknown> {
  data: T;
  message: string;
  code: string;
  requestId?: string;
}

interface ResponseMeta {
  status?: number;
  code?: string;
  message?: string;
  requestId?: string;
}

/** Dipakai di endpoint BFF untuk respons sukses. */
export function dataResponse<T>({
  data,
  status = 200,
  code = '',
  message = '',
  requestId = '',
}: ResponseMeta & { data: T }): Response {
  const body: BackendResponse<T> = { data, message, code, requestId };
  return Response.json(body, { status });
}

/** Dipakai di endpoint BFF untuk respons gagal. */
export function errorResponse({
  status = 500,
  code = '',
  message = '',
  requestId = '',
}: ResponseMeta = {}): Response {
  const body: BackendResponse<Record<string, never>> = {
    data: {},
    message,
    code,
    requestId,
  };
  return Response.json(body, { status });
}
