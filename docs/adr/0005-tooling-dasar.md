# ADR-0005: Tooling dasar: npm, Node 24, ESLint 10

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks

Semua orang dan agent harus memakai toolchain yang sama agar hasil install, lint, dan build konsisten. Saat setup, `eslint-plugin-astro` 3.x mewajibkan ESLint 10, sedangkan `eslint-plugin-jsx-a11y` resmi (6.10.2) baru mendukung sampai ESLint 9.

## Keputusan

- Package manager: **npm**, dikunci lewat `packageManager`, `engines`, dan `engine-strict=true`.
- Runtime: **Node 24 LTS** (`.nvmrc`); Astro mensyaratkan minimal Node 22.12.
- Lint: **ESLint 10** dengan `typescript-eslint`, `eslint-plugin-astro`, `eslint-plugin-react-hooks`, dan fork **`eslint-plugin-jsx-a11y-x`** pengganti jsx-a11y.
- Format: Prettier + `prettier-plugin-astro`; `eslint-config-prettier` mematikan aturan format di ESLint.
- Git hooks: husky + lint-staged + commitlint (Conventional Commits).
- Dilarang install dengan `--force` atau `--legacy-peer-deps`; dependency memakai range eksplisit, bukan `*`.

## Alternatif yang dipertimbangkan

- **pnpm**: lebih cepat dan ketat, tapi tidak dibutuhkan untuk repo satu paket.
- **ESLint 9 + jsx-a11y resmi**: tidak kompatibel dengan `eslint-plugin-astro` 3.x.

## Konsekuensi

- Positif: lint a11y tetap aktif di ESLint terbaru.
- Negatif: bergantung pada fork pihak ketiga.
- Karena itu: kembali ke `eslint-plugin-jsx-a11y` resmi begitu mendukung ESLint 10, lewat ADR baru yang menggantikan bagian ini.
