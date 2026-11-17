# Handoff: progres Aether per 2026-11-17

Ringkasan pekerjaan yang sebelumnya dikerjakan di luar repo (sesi Claude chat), supaya bisa dilanjutkan langsung di repo dengan Claude Code. Sumber kebenaran untuk aturan tetap `AGENTS.md`, `docs/CONVENTIONS.md`, dan `docs/adr/`. File ini hanya mencatat **status dan sisa pekerjaan**. Perbarui atau hapus begitu isinya sudah tidak relevan.

Action plan lengkap (Fase 0–8, strategi git, risiko) ada di dokumen Claude Docs "Action plan Aether". Isinya belum diperbarui sejak porting komponen dimulai.

---

## 1. Konteks singkat

Aether adalah boilerplate opinionated untuk dashboard dan sistem internal. Fungsinya dua: pilot cepat untuk tender, dan healing project lama. Fondasinya diekstrak dari project internal yang paling rapi (selanjutnya disebut **project acuan**). Repo ini juga berisi skill untuk AI agent.

Stack: Astro (adapter Node, `output: 'server'`), React 19.2 sebagai island `client:only="react"`, Tailwind v4, token Figma, npm, dan Node 24.

---

## 2. Status milestone

| Versi     | Isi                                                                               | Status                                  |
| --------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| v0.1.0    | Fondasi: tooling, env, Docker, health, test, `common` dasar, token, ADR 0001–0009 | **Sudah di-tag** dan ada GitHub Release |
| v0.2.0    | Design system: style prasyarat, primitif, katalog                                 | **Sedang dikerjakan** (lihat bagian 4)  |
| v0.3.0    | Auth & shell: `AuthStrategy`, `base-layout.astro`, `app-sidebar`                  | Belum                                   |
| v0.4.0    | Golden module (contoh modul lengkap, juga contoh resmi UI Contract)               | Belum                                   |
| v1.0.0-rc | Skill lengkap dan evaluasi                                                        | Belum                                   |
| v1.0.0    | Dipakai di pilot pertama                                                          | Belum                                   |

Release-please **dijeda** (`workflow_dispatch`) sampai PAT disetujui. Sampai saat itu, rilis dan tag dibuat manual.

---

## 3. Keputusan yang sudah diambil

Detail ada di ADR dan CONVENTIONS. Daftar ini untuk orientasi cepat.

| Topik             | Keputusan                                                                                                                                                                     | Rujukan        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Shell             | `.astro` hanya untuk routing dan prefetch. Satu island React per halaman, dengan skeleton di slot `fallback`                                                                  | ADR-0001       |
| Struktur          | `src/modules/<modul>` (screaming architecture), `common` untuk kode lintas modul, nama file kebab-case                                                                        | ADR-0002, [B1] |
| Impor antar modul | Lewat `index.ts` (aman untuk browser) dan `server.ts` (khusus server). Deep import dilarang. `common` diimpor per file                                                        | ADR-0008       |
| Auth              | BFF: browser hanya memanggil `/api/*`. Token disimpan di cookie `httpOnly` dan refresh di server. Kontrak `AuthStrategy` (`jwt`/`mock`). Masa berlaku token tidak di-hardcode | ADR-0003       |
| State             | `useState` + prefetch. TanStack Query masih berstatus **Diusulkan**                                                                                                           | ADR-0004       |
| Tooling           | ESLint 10 + `jsx-a11y-x` (fork), `import-x`, `better-tailwindcss`, `unicorn`, Prettier, husky, commitlint                                                                     | ADR-0005       |
| Styling           | Tailwind v4. Palet bawaan (`--color-*`) dan radius bawaan dihapus, jadi hanya token yang tersedia                                                                             | ADR-0006       |
| Audit             | `npm audit` hanya untuk dependency produksi (`audit:prod`). Dilarang `audit fix --force`                                                                                      | ADR-0007       |
| Brand & spacing   | `PUBLIC_BRAND` ditentukan saat build. Spacing memakai default Tailwind                                                                                                        | ADR-0009       |
| Lokasi skill      | `.agents/skills/` sebagai sumber, `.claude/skills` sebagai symlink, daftarnya di `AGENTS.md`                                                                                  | ADR-0010       |
| Teks UI           | `text('ID', 'EN')` dari `common/utils/i18n.ts`                                                                                                                                | [F2]           |
| React             | Tanpa `forwardRef` dan `displayName` (React 19)                                                                                                                               |                |
| Varian            | `tv` dari `common/styles/tv.ts`. Tidak memakai `cva`                                                                                                                          |                |
| Katalog komponen  | Storybook dan halaman showcase **dibatalkan**, diganti tabel di `common/components/README.md`                                                                                 |                |
| UI Contract       | Skill QA `ui-contract`, `data-testid` berformat `page-or-flow.element.intent`. Komponen meneruskan `data-testid` lewat `...props`, tanpa prop `testId`                        | [I5], J12      |
| Versi             | SemVer 0.x, Conventional Commits, changelog ala Keep a Changelog                                                                                                              |                |

---

## 4. v0.2.0: yang sudah dan belum

### Sudah selesai

- [x] **PR 6a: prasyarat style** (`common/styles/`). Isinya:
  - `interactive.ts` (pengganti `tremor.ts`)
  - `tv.ts` (impor dari `tailwind-variants/config`)
  - `animations.css`, `effects.css`
  - `global.css` (tambahan `tw-animate-css` dan font Inter)

  Test lulus. Sudah di-commit di branch `feat/style-prerequisites`. Catatan: `extensions.css` ikut 6a (bukan 6b) karena `global.css` langsung mengimpornya.

- [x] **Codemod migrasi warna**: `scripts/migrate-legacy-colors.mjs` dan `design-tokens/migration/` (pemetaan 72 token dan README).

### Sudah dikonfirmasi selesai (cek ulang 2026-11-17)

- [x] Kedua blok `no-restricted-imports` di `eslint.config.js` sudah memakai `paths: restrictedPaths`. Isinya melarang `tv` dari `tailwind-variants` dan `tailwind-variants/config`, serta melarang `class-variance-authority`.
- [x] Placeholder `[E?]` di pesan ESLint sudah diganti menjadi `[D2]`.
- [x] Codemod sudah di-commit, lewat PR #12 dengan judul `fix(color-tokens)` (bukan `chore(tokens)` seperti rencana awal; isinya sama).
- [x] Versi Astro sudah 7.4.4 dengan `@astrojs/node` 11 (lihat bagian 7): tidak perlu PR upgrade.
- [x] PR 6a di-commit di branch `feat/style-prerequisites`; PR 6b (Button) di `feat/button`, stacked di atasnya. `npm run verify` lolos di kedua state.
- [x] `docs/analysis/` kini di-ignore di `.gitignore`, ESLint, tsconfig, dan `.prettierignore` — file referensi tidak lagi membuat lint/check gagal.

### PR 6b: batch form (sedang berjalan)

- [x] **Button**: selesai dan disetujui lewat cek visual (2026-11-17). Di-commit di branch `feat/button`; lint, test, dan build lolos. Tambahan saat perbaikan:
  - `afterEach(cleanup)` di `tests/setup/vitest.setup.ts` — tanpa `globals: true` di vitest, auto-cleanup Testing Library tidak jalan sehingga render bocor antar test.
  - Spasi nyata (`{' '}`) setelah teks sr-only di state loading agar accessible name tidak menjadi `MemuatSimpan`.
  - Tiga keputusan API disetujui: default `type="button"`, `destructive-outline`/`destructive-ghost`, tanpa varian `glass`.
- [ ] Input
- [ ] Label
- [ ] Checkbox
- [ ] RadioGroup
- [ ] Select
- [ ] Textarea (sumber: `text-area.tsx`; nama file di Aether: `textarea.tsx`)

### PR 6c: feedback dan overlay

- [ ] Toast (empat varian digabung jadi satu komponen, `showToast` menerima opsi `testId`; pasang `sonner` dan `nanoid` kalau dipakai)
- [ ] Alert
- [ ] Badge
- [ ] Tooltip
- [ ] Popover
- [ ] Dialog
- [ ] Drawer
- [ ] Dropdown

### PR 6d: tampilan data

- [ ] Table (termasuk `.pinned-action-col` lama, ditulis ulang dengan `shadow-pinned` dan token, tanpa `!important`)
- [ ] Accordion

### Pertanyaan terbuka untuk v0.2.0

- [ ] Project acuan juga punya Radix `switch`, `tabs`, `toggle`, dan `toggle-group`, plus `cmdk`, `input-otp`, dan `react-day-picker`. Apakah komponen Switch, Tabs, Toggle, Command, OTP, dan DatePicker ada dan perlu dibawa? Untuk komponen yang belum ada sama sekali (Combobox, DatePicker, Pagination, Tabs), ambil dari Tremor Raw supaya gayanya konsisten.
- [ ] Setelah semua batch selesai, buat rilis `v0.2.0`.

---

## 5. Cara porting satu komponen

Komponen dari project acuan **tidak bisa disalin begitu saja**. Untuk setiap komponen:

1. Salin ke `src/modules/common/components/<nama>.tsx` (satu file per komponen, test di sebelahnya).
2. Jalankan `node scripts/migrate-legacy-colors.mjs <file>` untuk laporan, lalu ulangi dengan `--write`. Cek setiap baris berstatus `review` dan `value-changed`.
3. Ganti impor:
   - `@/.../tremor` diganti `@/modules/common/styles/interactive`,
   - `tv`/`VariantProps` dari `tailwind-variants` diganti `@/modules/common/styles/tv`.
4. Ganti sisa palet bawaan Tailwind dengan token:
   - `gray-*` → `neutral-*`
   - `red-*` → `negative-*`
   - `bg-white` → `bg-base-white`
   - teks putih di atas warna solid → `content-on-brand` atau `content-on-negative`
   - `rounded-lg` → `rounded-8` (skala radius: `rounded-4`…`rounded-32`, `rounded-full`)
5. Hapus hex arbitrary, `forwardRef`, `displayName`, `tremor-id`, `'use client'`, dan `cva`.
6. Teks bawaan diganti `text('ID', 'EN')`. Tombol ikon wajib punya `aria-label`.
7. Teruskan `data-testid` ke elemen interaktif lewat `...props`.
8. Tulis test (Testing Library, utamakan `getByRole`). Tambahkan satu baris di katalog `components/README.md`, dan catat perubahan API di tabel porting.
9. `npm run lint && npm test`, lalu cek visual di browser, termasuk `data-theme="dark"` dan minimal dua nilai `data-brand`.

### Bug yang sudah ketemu saat evaluasi (perbaiki saat porting)

| Komponen                  | Temuan                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input                     | Teks "Show password" masih hardcode bahasa Inggris. `aria-invalid` belum dipasang saat `hasError`. Pakai `hasErrorInput` versi baru (state fokus tetap merah)                                                                                     |
| Select, Accordion, Dialog | `displayName` milik Radix dimutasi secara global (misalnya `Accordion.displayName = 'AccordionItem'`). Hilang dengan sendirinya saat `displayName` dibuang                                                                                        |
| Popover                   | `max-h-[--radix-popper-available-height]` masih sintaks v3, sehingga batas tinggi tidak berlaku. Di v4 harus `max-h-(--radix-popper-available-height)`. Workaround `onWheel` yang mengirim `ArrowDown` buatan sebaiknya dibuang, lalu diuji ulang |
| Table                     | Prop `data` tidak di-destructure, sehingga bocor ke `<table>`. Class `caption` tidak valid. `TableRoot` punya dua `div` pembungkus yang tidak perlu                                                                                               |
| Toast                     | Empat komponen hampir identik, cukup satu dengan varian `tv`. Tombol tutup tanpa `aria-label`                                                                                                                                                     |
| Dialog, Drawer            | Tombol close tanpa label untuk screen reader. `scrollbar-thin` butuh plugin yang tidak terpasang                                                                                                                                                  |
| Alert                     | Pengecekan `typeof Icon === 'function'` gagal untuk ikon `memo`/`forwardRef` (bentuknya object)                                                                                                                                                   |
| Dropdown                  | Ada `'use client'` (sisa Next.js, tidak berarti apa-apa di Astro)                                                                                                                                                                                 |
| Tooltip                   | Setiap Tooltip membuat Provider sendiri. Mode sentuh memakai `cloneElement` yang menimpa handler milik child                                                                                                                                      |
| Badge                     | `base: cx(...)` di dalam `tv` tidak perlu                                                                                                                                                                                                         |

### Hal teknis yang sudah terbukti (jangan diulang)

- `twMergeConfig` di `tailwind-variants` v3 hanya didukung entry `tailwind-variants/config`.
- Keyframe di dalam `@theme` dibuang saat build kalau tidak ada `--animate-*` yang memakainya. Karena itu `shimmer` ditaruh di luar `@theme`.
- Shadow dan token yang merujuk variabel brand/theme harus memakai `@theme inline` dan merujuk lapisan `--brand-*`/`--product-*`/`--primitive-*`, bukan `--color-*`.
- Di jsdom, `Blob` tidak cocok dengan `Response` dari undici. Assert ke `size`/`text()`, bukan `instanceof`.
- `background-primary` lolos lint, tapi artinya berubah (lama: navy, Figma: latar putih). Cek setiap pemakaiannya.
- `negative-700` di Figma bernilai `#570303`, jauh lebih gelap daripada `red-700` Tailwind. Untuk hover, pakai pola `*-600/85`.

---

## 6. Setelah v0.2.0

- [ ] **PR 7: `common/layouts/base-layout.astro`**: `lang`, `data-brand` dari `PUBLIC_BRAND`, `data-theme`, impor `global.css`.
- [ ] **Fase 3 (v0.3.0)**: implementasi `AuthStrategy` (verifikasi JWT lewat `AUTH_JWKS_URL`, bukan `jwt-decode`), alur login/refresh di BFF, dan `app-sidebar` generik. Ini **ditulis ulang, bukan diporting**: item menu dari `route-permissions.ts`, logo dari brand aktif, menu user sebagai slot, status collapse di cookie, tanpa token di props, dan tanpa impor ke modul lain.
- [ ] **Fase 4 (v0.4.0)**: golden module, termasuk stack form (`react-hook-form`, `zod`, `@hookform/resolvers`) dan contoh UI Contract.
- [ ] Skill healing (memakai `legacy-color-map.json` dan codemod), lalu evaluasi skill (menuju v1.0.0-rc).

---

## 7. Tindak lanjut di luar kode

### Koreksi dokumen

- [ ] ADR-0009: ganti "lewat env saat deploy" jadi "ditentukan saat build (build arg)". Commit: `docs(adr): correct brand timing in ADR-0009`.
- [ ] Perbarui progres di dokumen action plan (Claude Docs), atau pindahkan isinya ke repo.

### Cek di project acuan dan repo

- [x] Versi Astro: Aether sudah di Astro 7.4.4 / `@astrojs/node` 11 — selaras dengan project acuan, tidak perlu PR upgrade.
- [ ] Seberapa luas `react-i18next` dipakai di project acuan: `grep -rlE "useTranslation|i18next|<Trans" src | wc -l`. Kalau sedikit, cukup dikonversi ke `text()` saat porting.

### Ke tim lain

- [ ] **Tim QA**: konfirmasi bahwa golden module dijadikan contoh resmi UI Contract.
- [ ] **Tim desain**:
  - Tambahkan token **Content/On-Brand** dan **Content/On-Negative**. Sementara ada di `extensions.css`; pakai nama yang sama supaya komponen tidak berubah.
  - Tambahkan **Content/Disabled** (lama `#D5D7DA`).
  - Konfirmasi kontras `Content/Positive` (`#3CC14E`) di atas putih.
  - Tambahkan warna **oranye semantic** kalau peringatan oranye masih dipakai.
  - Putuskan apakah biru lama `#2C37FF` perlu jadi mode brand sendiri.
  - Tentukan token **focus/stroke-focus**. Saat ini `focusRing` memakai `guide-500`.
  - Tentukan token **gradien** kalau quick action atau banner dibutuhkan.

### Infra

- [ ] Release-please menunggu persetujuan PAT. Setelah disetujui, aktifkan lagi trigger `push` di workflow.
- [ ] ADR-0004 (TanStack Query) diputuskan setelah golden module berjalan.

---

## 8. Melanjutkan dengan Claude Code

Supaya agent bisa membaca komponen asli tanpa akses ke project acuan, salin file komponen project acuan ke folder yang tidak di-commit, misalnya `docs/analysis/reference/components/`. Folder `docs/analysis/` sudah tidak di-commit dan sudah di-ignore di `.gitignore`, ESLint, tsconfig, dan `.prettierignore`. Isi saat ini: 19 komponen + `tremor.ts` + `tailwind.css`.

Prompt pembuka yang bisa dipakai:

> Baca `AGENTS.md`, `docs/CONVENTIONS.md`, dan `docs/handoff.md`. Kita lanjut v0.2.0 batch form. Button sudah ada di `src/modules/common/components/button.tsx` sebagai contoh pola. Porting `input.tsx` dari `docs/analysis/reference/components/` mengikuti bagian 5 di handoff. Jalankan lint dan test, lalu tunjukkan diff dan daftar yang perlu kucek visual.
