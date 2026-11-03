# AGENTS.md

Boilerplate dashboard / sistem internal: **Astro (adapter Node, on-demand rendering) sebagai shell**, **React sebagai aplikasi**, styling dengan **Tailwind CSS v4**. Astro mengurus routing, layout, middleware auth, dan proxy BFF; seluruh UI interaktif ada di React.

Baca file ini dulu, lalu `docs/CONVENTIONS.md` (aturan lengkap dengan ID seperti `[C2]`), lalu README di folder tempat kamu bekerja.

## Perintah

| Perintah                                  | Kegunaan                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run dev -- --background`             | Jalankan dev server di background. Kelola dengan `astro dev stop`, `astro dev status`, `astro dev logs` |
| `npm run lint`                            | ESLint                                                                                                  |
| `npm run format` / `npm run format:check` | Prettier                                                                                                |
| `npm run check`                           | `astro check` (typecheck)                                                                               |
| `npm run test`                            | Vitest                                                                                                  |
| `npm run build`                           | Build produksi                                                                                          |
| `npm run audit:prod`                      | Audit keamanan dependency produksi                                                                      |
| `npm run tokens`                          | Generate `tokens.css` dari export Figma                                                                 |
| `npm run verify`                          | Semua cek di atas sekaligus                                                                             |
| `npm run gen:module <nama>`               | Scaffold modul baru (menyusul)                                                                          |

**Sebelum menyatakan tugas selesai, semua cek harus lolos:** lint, format:check, check, test, build.

## Arsitektur

```
src/
  pages/            routing Astro + endpoint api/ (BFF). Tipis, tanpa logika bisnis
  modules/
    common/         dipakai lintas modul: components, hooks, services, utils, styles, layouts, auth
    <nama-modul>/   satu modul bisnis: components, services, hooks, schemas, types, constants, utils, mocks, index.ts
  middleware/       cek sesi + permission sebelum halaman dirender
```

Arah dependency satu arah: `pages` -> `modules/<modul>` -> `modules/common`.

## Aturan keras

1. **`.astro` hanya untuk routing, layout, dan meneruskan data server.** Tidak ada logika bisnis.
2. **Satu halaman = satu island:** `client:only="react"` dengan slot `fallback` berisi skeleton.
3. **Impor antar modul hanya lewat `@/modules/<modul>` (`index.ts`).** Dilarang deep import ke modul lain dan dilarang menyalin kode antar modul. `common` diimpor langsung per file dan tidak boleh import dari modul atau `pages`. Di dalam modul sendiri pakai path relatif. (ADR-0008)
4. **Data:** komponen → service modul (`services/`) → `/api/*`. Data awal di-prefetch di `.astro` dan dioper sebagai props; state memakai `useState`. Jangan menambah library state (Redux, Zustand, TanStack Query) tanpa ADR (ADR-0004 berstatus Diusulkan).
5. **Filter, sort, pagination, dan tab disimpan di URL.**
6. **Browser hanya memanggil `/api/*` (BFF).** Komponen dan hook tidak pernah `fetch` ke jaringan langsung; itu tugas service modul.
7. **Token tidak boleh disentuh dari React.** Token tidak dioper sebagai props, tidak di localStorage atau state. Endpoint `/api/*` membaca cookie sendiri dan mengurus refresh. Pakai `useCurrentUser()` dan `<Can permission="...">`.
8. **Env var lewat `astro:env`.** Secret hanya diimpor dari `astro:env/server`, tidak pernah di komponen React.
9. **Styling dengan Tailwind, nilai hanya dari token.** Token di-generate dari Figma ke `modules/common/styles/tokens.css`; utamakan token semantic (`background-*`, `content-*`, `stroke-*`), lalu `brand-*`. Dilarang arbitrary value seperti `bg-[#ff0000]` atau `p-[13px]`; kalau butuh nilai baru, tambahkan token. Cek `modules/common/components` sebelum membuat komponen baru.
10. **Halaman baru wajib didaftarkan** di `modules/common/auth/route-permissions.ts`, dan semua navigasi memakai konstanta rute dari sana, bukan string literal.

## Penamaan

- File dan folder: **kebab-case** (`user-management-view.tsx`, `use-current-user.ts`).
- Di dalam kode: komponen PascalCase, hook dan fungsi camelCase. `user-management-view.tsx` mengekspor `UserManagementView`.
- Komponen yang di-mount oleh `src/pages` diberi akhiran `-view`.

## Git

- Jangan commit langsung ke `main`. Selalu buat branch: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `skills/...`.
- Commit dan judul PR mengikuti Conventional Commits, misalnya `feat(user-management): add role filter`.
- Satu tugas = satu branch = satu PR kecil.
- Jangan pakai `--force` atau `--legacy-peer-deps` saat install. Kalau ada konflik peer dependency, laporkan.
- Jangan pernah menjalankan `npm audit fix --force`. Temuan audit di devDependencies dianalisis dulu (lihat ADR-0007), bukan dipaksa.
- Jangan menambah dependency baru tanpa alasan yang ditulis di deskripsi PR.

## Batasan

- Jangan mengubah alur auth (`modules/common/auth`, `src/middleware/`, `src/pages/api`) kecuali tugasnya memang tentang auth.
- Jangan melonggarkan aturan lint atau TypeScript untuk membuat cek lolos. Perbaiki kodenya.
- Jangan mengedit `src/modules/common/styles/tokens.css` secara manual. Ubah di Figma, export ke `design-tokens/figma/`, lalu jalankan `npm run tokens`.
- Saat memindahkan komponen dari project lama, jalankan `scripts/migrate-legacy-colors.mjs` dan laporkan item berstatus review.
- Kalau requirement ambigu atau bertentangan dengan aturan di sini, tanyakan dulu.

## Referensi

- Konvensi lengkap: `docs/CONVENTIONS.md`
- Keputusan arsitektur: `docs/adr/`
- Skills: `.claude/skills/` (menyusul)
- Dokumentasi Astro: https://docs.astro.build
  - [Routing, dynamic routes, middleware](https://docs.astro.build/en/guides/routing/)
  - [Astro components](https://docs.astro.build/en/basics/astro-components/)
  - [Framework components (React)](https://docs.astro.build/en/guides/framework-components/)
  - [Styling](https://docs.astro.build/en/guides/styling/)
- Dokumentasi Tailwind CSS v4: https://tailwindcss.com/docs
