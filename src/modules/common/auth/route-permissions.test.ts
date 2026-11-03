import { describe, expect, it } from 'vitest';

import { AUTH_REDIRECT_REASONS, buildLoginUrl } from './route-permissions';

describe('buildLoginUrl', () => {
  it('tanpa parameter', () => {
    expect(buildLoginUrl()).toBe('/login');
  });

  it('membawa returnTo dan reason', () => {
    expect(
      buildLoginUrl('/projects?page=2', AUTH_REDIRECT_REASONS.sessionExpired),
    ).toBe('/login?returnTo=%2Fprojects%3Fpage%3D2&reason=session_expired');
  });

  it('tidak membuat returnTo ke halaman login sendiri', () => {
    expect(buildLoginUrl('/login')).toBe('/login');
  });
});
