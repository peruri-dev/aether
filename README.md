# Aether

Boilerplate untuk dashboard dan sistem internal: **Astro** (adapter Node, on-demand rendering) sebagai shell — routing, layout, middleware auth, dan proxy BFF — dengan **React** sebagai aplikasi dan **Tailwind CSS v4** untuk styling. Satu codebase untuk banyak instansi: brand ditentukan lewat env saat build, dan token warna di-generate dari Figma.

> **Status: v0.1.0 — rilis fondasi.** Yang tersedia baru fondasi teknis. Auth, layout shell, dan modul contoh belum ada, jadi boilerplate ini **belum disarankan untuk memulai project baru**.

## Yang sudah ada

- Astro + React 19; semua halaman on-demand (`output: 'server'`, adapter Node standalone), satu island `client:only="react"` per halaman dengan fallback skeleton.
- BFF: browser hanya memanggil `/api/*` di origin yang sama. Token ada di cookie `httpOnly` dan hanya disentuh server — contoh endpoint `GET /api/health`.
- Design token dari Figma: `design-tokens/figma/` → `npm run tokens` → `tokens.css`. Multi-brand (`data-brand`: neutral, bgn, bkn, inagov, lan, panrb) dan light/dark (`data-theme`). Palet bawaan Tailwind dihapus.
- Tooling ketat: TypeScript strict, ESLint 10 (batas impor antar modul, filename kebab-case, dilarang `any`), Prettier, husky + lint-staged + commitlint (Conventional Commits).
- Vitest + Testing Library; CI memeriksa lint, format, `astro check`, test, build, dan sinkronisasi token.
- Docker multi-stage dengan healthcheck; satu image per brand lewat build arg.
- Kontrak dasar di `src/modules/common/`: `fetchApi`, `ApiError`/`RedirectError`, `dataResponse`/`errorResponse`, `text()` bilingual, `cx()`, konstanta rute.

## Belum tersedia

Implementasi auth (`AuthStrategy`, `src/middleware/`, halaman login), layout shell (sidebar), komponen design system, modul bisnis contoh, scaffolding `npm run gen:module`, dan test Playwright. Perkembangan dicatat di [CHANGELOG.md](CHANGELOG.md).

## Mulai

Prasyarat: Node `>=22.23.4` (lihat `.nvmrc`) dan npm. `.npmrc` memakai `engine-strict=true`, jadi versi Node dikecek saat install.

```sh
npm install
cp .env.example .env   # AUTH_STRATEGY=mock cukup untuk development dan demo
npm run dev            # http://localhost:4321
```

| Perintah                          | Kegunaan                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Dev server. Mode background: `npm run dev -- --background`, kelola dengan `astro dev stop`, `astro dev status`, `astro dev logs` |
| `npm run verify`                  | Gerbang kualitas: lint, format:check, `astro check`, test, build. **Wajib lolos sebelum tugas dinyatakan selesai.**              |
| `npm run test`                    | Vitest (`test:watch` untuk mode watch)                                                                                           |
| `npm run check`                   | Typecheck (`astro check`)                                                                                                        |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                |
| `npm run tokens`                  | Generate `tokens.css` dari export Figma di `design-tokens/figma/`                                                                |
| `npm run build`                   | Build produksi ke `dist/`                                                                                                        |
| `npm run preview`                 | Preview hasil build                                                                                                              |
| `npm run audit:prod`              | Audit keamanan dependency produksi (lihat [ADR-0007](docs/adr/0007-kebijakan-audit-dependency.md))                               |

## Arsitektur

```
src/
  pages/            routing Astro + endpoint api/ (BFF). Tipis, tanpa logika bisnis
  modules/
    common/         dipakai lintas modul: components, services, hooks, utils, styles, auth
    <nama-modul>/   satu modul bisnis: components, services, schemas, types, constants, index.ts
  middleware/       cek sesi + permission sebelum halaman dirender (belum ada)
```

Arah dependency satu arah: `pages` → `modules/<modul>` → `modules/common`. Impor antar modul hanya lewat `@/modules/<modul>` (`index.ts`); `common` diimpor langsung per file.

Aliran data:

```
Komponen React → service modul (services/) → /api/* (BFF) → backend
```

Aturan utama (lengkapnya di [AGENTS.md](AGENTS.md) dan [docs/CONVENTIONS.md](docs/CONVENTIONS.md)):

- `.astro` hanya untuk routing, layout, guard, dan prefetch data. UI interaktif ada di React.
- Komponen tidak pernah `fetch` ke jaringan langsung dan tidak pernah menyentuh token. Refresh token adalah urusan BFF.
- Filter, sort, pagination, dan tab disimpan di URL.
- Warna dan radius hanya dari token; dilarang arbitrary value (`bg-[#ff0000]`, `p-[13px]`).
- Semua rute diambil dari konstanta di `src/modules/common/auth/route-permissions.ts`.

## Environment

Semua variabel aplikasi didefinisikan di `src/env.schema.ts` dan dibaca lewat `astro:env` — jangan pakai `process.env`. Nilai yang berbeda per environment dideklarasikan `access: 'secret'` (dibaca saat runtime, satu image untuk dev/staging/production); nilai yang tetap per build (mis. `PUBLIC_BRAND`) dideklarasikan `access: 'public'` dan di-inline saat build.

| Variabel          | Wajib | Default            | Keterangan                                                              |
| ----------------- | ----- | ------------------ | ----------------------------------------------------------------------- |
| `API_BASE_URL`    | ✔     | —                  | URL backend                                                             |
| `API_VERSION`     |       | `v1`               | Prefix versi API                                                        |
| `API_KEY`         |       | —                  | Opsional                                                                |
| `API_TIMEOUT_MS`  |       | `15000`            | Timeout pemanggilan backend                                             |
| `AUTH_STRATEGY`   |       | `jwt`              | `jwt` (backend sungguhan) atau `mock` (tanpa backend, untuk dev/demo)   |
| `AUTH_JWKS_URL`   |       | —                  | Opsional, endpoint JWKS untuk verifikasi signature JWT                  |
| `PUBLIC_BRAND`    |       | `neutral`          | `neutral`, `bgn`, `bkn`, `inagov`, `lan`, `panrb`. Di-inline saat build |
| `PUBLIC_APP_NAME` |       | `Dashboard`        | Di-inline saat build                                                    |
| `HOST` / `PORT`   |       | `0.0.0.0` / `4321` | Hanya untuk menjalankan server Node                                     |

Menambah variabel: update `env.schema.ts` **dan** `.env.example` dalam PR yang sama, lalu `npx astro sync`. `.env` tidak pernah di-commit.

## Docker

```sh
docker build --build-arg PUBLIC_BRAND=inagov --build-arg PUBLIC_APP_NAME="Portal X" -t aether .
docker run -e API_BASE_URL=https://api.example.com -p 4321:4321 aether
```

- Satu image per brand: `PUBLIC_BRAND` dikirim sebagai build arg; nilai runtime lain dikirim lewat environment variable saat container dijalankan.
- Image mendengarkan `HOST=0.0.0.0` port `4321`, berjalan sebagai user non-root dengan tini, dan punya healthcheck ke `/api/health`.

## Dokumentasi

Urutan baca:

1. [AGENTS.md](AGENTS.md) — aturan keras untuk developer dan AI agent.
2. [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — konvensi lengkap ber-ID (`[C2]`, dst.) yang bisa dirujuk saat review.
3. README di folder tempat kamu bekerja: [src/modules/](src/modules/README.md), [src/modules/common/](src/modules/common/README.md), [src/pages/](src/pages/README.md), [design-tokens/](design-tokens/README.md).
4. [docs/adr/](docs/adr/README.md) — keputusan arsitektur (0001–0009) beserta alternatif dan konsekuensinya.

## Kontribusi

- Jangan commit langsung ke `main`. Selalu buat branch: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `skills/...`.
- Commit dan judul PR mengikuti Conventional Commits, misalnya `feat(user-management): add role filter`.
- Satu tugas = satu branch = satu PR kecil.
- `npm run verify` wajib lolos sebelum PR. CI menjalankan hal yang sama.
- Jangan install dengan `--force` atau `--legacy-peer-deps`, dan jangan jalankan `npm audit fix --force` — temuan audit dianalisis dulu ([ADR-0007](docs/adr/0007-kebijakan-audit-dependency.md)).
- Dependency baru butuh alasan yang ditulis di deskripsi PR.

## Rilis

Versi dan changelog di-generate otomatis oleh [release-please](https://github.com/googleapis/release-please) dari commit Conventional Commits di `main`. Saat ini workflow rilis **dipause** (menunggu `RELEASE_PLEASE_TOKEN`) dan hanya bisa dijalankan manual dari tab Actions. Commit tetap wajib Conventional Commits supaya changelog tetap bisa di-generate penuh saat diaktifkan kembali.
