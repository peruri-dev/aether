/**
 * Satu sumber rute aplikasi (CONVENTIONS [G4]).
 * Fase 3 menambahkan permission per rute di file ini untuk middleware dan menu.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  accessDenied: '/access-denied',
} as const;

/** Alasan redirect ke login, dibaca halaman login untuk menampilkan pesan. */
export const AUTH_REDIRECT_REASONS = {
  sessionExpired: 'session_expired',
  sessionInvalidated: 'session_invalidated',
} as const;

export type AuthRedirectReason =
  (typeof AUTH_REDIRECT_REASONS)[keyof typeof AUTH_REDIRECT_REASONS];

/** URL login yang membawa halaman asal (returnTo) dan alasan redirect. */
export function buildLoginUrl(
  returnTo?: string,
  reason?: AuthRedirectReason,
): string {
  const params = new URLSearchParams();
  if (returnTo && returnTo !== ROUTES.login) params.set('returnTo', returnTo);
  if (reason) params.set('reason', reason);
  const query = params.toString();
  return query ? `${ROUTES.login}?${query}` : ROUTES.login;
}
