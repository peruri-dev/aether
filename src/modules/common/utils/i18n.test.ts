import { afterEach, describe, expect, it } from 'vitest';

import { getLocale, text } from './i18n';

describe('text', () => {
  afterEach(() => {
    document.documentElement.lang = '';
  });

  it('memakai bahasa Indonesia secara default', () => {
    expect(getLocale()).toBe('id');
    expect(text('Simpan', 'Save')).toBe('Simpan');
  });

  it('memakai bahasa Inggris saat <html lang="en">', () => {
    document.documentElement.lang = 'en-US';
    expect(getLocale()).toBe('en');
    expect(text('Simpan', 'Save')).toBe('Save');
  });
});
