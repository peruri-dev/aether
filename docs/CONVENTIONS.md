# Konvensi kode

Aturan baku boilerplate. Diekstrak dari project acuan, lalu dikurasi: dipertahankan, diubah, atau dibuang.
Setiap aturan punya ID (misalnya `[C2]`) supaya bisa dirujuk di review, skill, dan ADR.

Prioritas kalau ada yang bertentangan: **ADR > dokumen ini > kebiasaan di kode lama**.
Aturan yang bisa dicek mesin dipaksakan lewat ESLint; jangan melonggarkan lint untuk meloloskan kode.

---

## A. Struktur

**[A1] Satu modul = satu folder.** Semua kode fitur ada di `src/modules/<modul>/`. Tidak ada folder global `src/components`, `src/utils`, atau sejenisnya. `src/` hanya berisi `pages/`, `modules/`, `middleware/`, dan `env.schema.ts`. Test endpoint dan file setup test ada di `tests/` di root repo [I2].

**[A2] Anatomi modul.** Subfolder dibuat sesuai kebutuhan; minimal `components/` dan `services/`.

```text
src/modules/<modul>/
  components/   komponen modul, termasuk view per halaman
  services/     pemanggil /api/* (client-safe)
  hooks/        use-*.ts
  schemas/      *.schema.ts (Zod) — selalu jamak
  types/        tipe domain
  constants/    konstanta modul
  utils/        fungsi murni modul (tanpa sub-folder seperti utils/common/)
  mocks/        handler MSW + fixtures
  index.ts      public API modul (lihat [A3])
```

**[A3] Public API modul (ADR-0008).** Aturan impor:

| Dari                              | Ke                  | Cara                                                    |
| --------------------------------- | ------------------- | ------------------------------------------------------- |
| Mana pun                          | `common`            | Langsung per file: `@/modules/common/components/button` |
| Modul A atau `src/pages`          | Modul B             | Hanya lewat `@/modules/b`                               |
| `.astro` dan `src/pages/api` saja | Kode server modul B | Lewat `@/modules/b/server`                              |
| Di dalam modul sendiri            | —                   | Path relatif (`../services/...`)                        |

- `index.ts` hanya berisi **named export** yang dipilih; dilarang `export *`.
- `index.ts` hanya mengekspor kode yang aman untuk browser. Kode khusus server (prefetch di frontmatter, pemanggil backend yang memakai `astro:env/server`) diekspor lewat `server.ts`, yang tidak boleh diimpor dari file `.tsx`.
- Ketergantungan melingkar antar modul dilarang (`import/no-cycle`).
- `common` tidak punya `index.ts`.

**[A4] Kapan naik ke `common`.** Kode yang tidak mengenal domain bisnis dan dipakai dua modul atau lebih dipindah ke `common` **saat itu juga**, bukan "nanti". Kode yang mengandung aturan domain tetap di modul pemiliknya dan dibagikan lewat `index.ts`. Uji cepat: _apakah kode ini masuk akal di aplikasi dengan domain lain?_ Ya → `common`; tidak → `index.ts`. **Dilarang menyalin** kode antar modul.

**[A5] Halaman sejajar dengan modul.** `src/pages/<modul>/` memetakan ke `src/modules/<modul>/` dengan nama yang sama.

**[A6] Endpoint BFF.** Satu folder per resource di `src/pages/api/<resource>/`, file entry `index.ts`. Semua halaman dan endpoint di-render on-demand (`output: 'server'` di `astro.config`); halaman yang memang statis menulis `export const prerender = true` secara eksplisit.

**[A7] Endpoint health.** `GET /api/health` mengembalikan `{ status: 'ok' }` tanpa memanggil backend, terdaftar sebagai rute publik di middleware, dan dipakai healthcheck Docker.

## B. Penamaan

**[B1] Semua file dan folder kebab-case**, dipaksakan `unicorn/filename-case`. Pengecualian: file route dinamis Astro (`[id].astro`, `[...path].ts`). Di dalam kode tetap PascalCase untuk komponen dan camelCase untuk fungsi dan hook.

**[B2] Akhiran peran komponen:** `-view` (di-mount halaman), `-dialog`, `-form`, `-table`, `-list`, `-item`, `-card`, `-filter`, `-bar`, `-layout`, `-step`.

**[B3] Hook:** `use-<subjek>.ts` di folder `hooks/`.

**[B4] Service:** `<kata-kerja>-<resource>.ts` di folder `services/`. Pakai `fetch-` untuk membaca data; aksi lain memakai kata kerjanya (`submit-document.ts`, `upload-file.ts`).

**[B5] Schema:** `<subjek>.schema.ts` di folder `schemas/`. Tipe form diturunkan dengan `z.infer`, tidak ditulis ulang.

**[B6] Komponen modul:** `export default function`, props `interface <Nama>Props` dipakai sebagai `Readonly<<Nama>Props>`, return type `React.ReactNode`.

**[B7] Primitif di `common/components`:** named export, mengekspor varian dan tipe props (`export { Button, buttonVariants, type ButtonProps }`). Proyek memakai React 19, jadi **`ref` diterima sebagai props biasa; jangan memakai `forwardRef`** di kode baru. Saat porting komponen lama, `forwardRef` dan `displayName`-nya dilepas.

**[B8] Nama props selalu `<NamaKomponen>Props`**, tidak pernah `Props` generik.

## C. Astro vs React

**[C1] `.astro` hanya untuk pekerjaan server:** routing, layout, guard, prefetch data, redirect. Tidak ada UI interaktif di `.astro`.

**[C2] Satu halaman = satu island:** layout dasar + tepat satu view dengan `client:only="react"` dan slot `fallback` berisi skeleton.

**[C3] Props view hanya data yang aman dan serializable.** View menerima data hasil prefetch di frontmatter dan info user yang dibutuhkan UI (nama, role, permission). **Token tidak pernah dioper ke React** (ADR-0003). _Diubah dari project acuan_, yang dulu mengoper `accessToken` dan `refreshToken` sebagai props.

**[C4] Guard terpusat.** Sesi dan akses per rute dicek di `src/middleware/` berdasarkan peta di `common/auth/route-permissions.ts`. Frontmatter halaman hanya memuat cek yang spesifik ke resource (misalnya "user ini pemilik dokumen ini"); gagal → `Astro.redirect('/access-denied')`.

## D. Komponen dan styling

**[D1] Gabung class lewat `cx()`** dari `common/styles/cx.ts` (twMerge + clsx). Jangan impor `clsx` atau `twMerge` langsung.

**[D2] Varian komponen memakai `tailwind-variants` (`tv`).** Tidak memakai `cva` atau if-else className manual.

**[D3] Ikon dari `react-icons/tb`** (Tabler, prefiks `Tb`).

**[D4] Warna dan radius hanya dari token Figma** (ADR-0006, `design-tokens/README.md`):

- Utamakan token semantic: `background-*`, `content-*`, `stroke-*`; lalu `brand-*`; lalu skala status (`neutral`, `guide`, `positive`, `negative`, `warning`).
- Dilarang arbitrary value (`bg-[#…]`, `p-[13px]`) dan hex di `style`.
- Satu-satunya pengecualian: kode canvas (misalnya Konva), yang membaca nilai dari variabel CSS token, bukan hex.
- Komponen hasil porting dari project lama wajib melewati `scripts/migrate-legacy-colors.mjs`.
- `tokens.css` di-generate dari `design-tokens/figma/` dengan `npm run tokens` dan **tidak boleh diedit manual**. Perubahan JSON token dan `tokens.css` hasil generate di-commit dalam PR yang sama; CI memeriksa keduanya sinkron.

**[D5] Ukuran file:** komponen idealnya di bawah 300 baris (ESLint `max-lines`, warn). Pecah per section atau langkah ke komponen anak.

## E. Data dan state

**[E1] Alur data:** komponen → service modul → `/api/*` (BFF) → backend. Komponen dan hook tidak pernah memanggil `fetch` ke jaringan langsung.

**[E2] Token hanya di server (ADR-0003).** Endpoint `/api/*` membaca token dari cookie `httpOnly` lewat `context.cookies`, menempelkannya ke request backend, dan menangani refresh token. Service di sisi React cukup `fetch('/api/...')` tanpa token. _Diubah dari project acuan_, yang dulu menyimpan dan me-refresh token di klien.

**[E2a] Masa berlaku tidak di-hardcode.** Umur cookie diambil dari respons backend (`expires_in` atau klaim `exp` di token), bukan angka tetap. Project acuan memakai access token 15 menit dan refresh token 48 jam, tapi project lain bisa berbeda, bahkan memakai session atau OAuth; semua perbedaan itu ditangani di implementasi `AuthStrategy` (ADR-0003), tidak di modul fitur. Saat refresh token habis, arahkan ke login dengan `returnTo`.

**[E3] Kontrak respons seragam:** `BackendResponse<T> = { data, message, code, requestId? }`, dibuat lewat helper `dataResponse` / `errorResponse`.

**[E4] State (ADR-0004 berstatus Diusulkan).** Untuk saat ini ikuti project acuan:

- Data awal di-prefetch di `.astro` dan dioper sebagai props.
- State dengan `useState` dan lifting props. Jangan menambah Redux, Zustand, atau TanStack Query tanpa keputusan ADR.
- Filter, sort, pagination, dan tab disimpan di URL.

**[E5] Context** boleh dipakai di dalam satu modul untuk pohon komponen yang kompleks. Context tidak bisa dibagi antar island.

**[E6] Sinyal lintas halaman lewat query string,** dibaca dan dibersihkan dengan `useFlashToastParam` dari `common/hooks`. Tidak memakai storage global untuk ini.

## F. Form

**[F1] Setiap form memakai `react-hook-form` + `zodResolver`** dengan schema di `schemas/`. Validasi tidak ditulis manual di komponen.

**[F2] Pesan validasi bilingual inline** dengan helper `text('Indonesia', 'English')` dari `common/utils`, ditulis langsung di schema. Gaya kunci `zMessage('...')` tidak dipakai; schema lama yang memakainya dikonversi saat porting.

## G. Error dan navigasi

**[G1] Dua kelas error:** `ApiError(status, code, message, data)` untuk error API, dan `RedirectError(path, status)` yang ditangkap `.astro` lalu diterjemahkan menjadi `Astro.redirect`.

**[G2] Notifikasi hanya lewat `showToast`** dari `common/components/toast`. `sonner` hanya diimpor di wrapper dan di layout dasar.

**[G3] Endpoint BFF selalu dibungkus try/catch;** error tak terduga di-log lalu dikembalikan sebagai `errorResponse({ status: 500 })`.

**[G4] Rute selalu dari konstanta.** Semua path diambil dari `common/auth/route-permissions.ts`, satu sumber untuk menu, guard, dan navigasi. Dilarang string literal rute. Navigasi programatik memakai full reload (`globalThis.location.href`), disertai query toast bila perlu.

## H. Responsif

**[H1] Mobile-first.** Kelas tanpa prefiks untuk mobile, `sm:` untuk penskalaan elemen, `lg:` khusus pergantian layout shell (sidebar, dua kolom). `md:` boleh dipakai di level komponen.

**[H2] Satu implementasi sidebar** di `common`, dengan lebar dari satu konstanta atau token.

## I. Kualitas

**[I1] Gerbang kualitas:** `npm run verify` (lint, format, `astro check`, test, build) wajib lolos sebelum tugas dinyatakan selesai. Lint tidak dijalankan di dalam `npm run build`; itu tugas `verify` dan CI.

**[I2] Test:** Vitest + Testing Library (jsdom) untuk unit dan komponen, Playwright untuk alur kritis (menyusul). Project acuan belum punya test; boilerplate menambahkannya sejak awal.

- Test kode modul diletakkan berdampingan dengan file aslinya: `src/modules/<modul>/utils/format-name.test.ts`.
- **Jangan pernah menaruh file test di `src/pages/`.** Astro memperlakukan setiap file di sana sebagai route, sehingga test akan ikut menjadi endpoint. Test endpoint diletakkan di `tests/api/`.
- File setup test ada di `tests/setup/`.

**[I3] Aturan ESLint yang tidak boleh dilonggarkan:** `no-explicit-any` (error), `no-non-null-assertion` (error), `explicit-function-return-type` (warn, `allowExpressions`), `consistent-type-imports`, `import-x/order` alfabetis bergrup, `import-x/no-cycle`, `no-console` (kecuali `warn` dan `error`).

- `no-console` hanya berlaku untuk `src/`. Script CLI di `scripts/` memang mencetak ke konsol.
- `react/no-array-index-key` menyusul: plugin resminya belum mendukung ESLint 10.

**[I4] Dependency:** jangan install dengan `--force` atau `--legacy-peer-deps`, dan jangan menjalankan `npm audit fix --force`. Konflik peer dependency dilaporkan dan dicari jalan keluarnya. Gerbang audit di CI hanya untuk dependency produksi (`npm run audit:prod`, ADR-0007). Dependency memakai range eksplisit, bukan `*`.

## J. Anti-pattern

| ID  | Dilarang                                                                   | Ganti dengan                                                          |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| J1  | `fetch` ke jaringan dari komponen atau hook                                | Service modul → `/api/*` [E1]                                         |
| J2  | `any`, `@ts-ignore`, `@ts-nocheck`                                         | `unknown` + narrowing; `eslint-disable` hanya per baris dengan alasan |
| J3  | Hex, px mentah, arbitrary value                                            | Token [D4]                                                            |
| J4  | Deep import ke modul lain                                                  | `@/modules/<modul>` [A3]                                              |
| J5  | Menyalin kode antar modul                                                  | Naik ke `common` atau ekspor lewat `index.ts` [A4]                    |
| J6  | String literal rute                                                        | Konstanta rute [G4]                                                   |
| J7  | Token di props React, localStorage, atau state                             | Cookie `httpOnly` + BFF [E2]                                          |
| J8  | Barrel di dalam subfolder modul, `utils/common/`, folder `schema/` tunggal | Struktur [A2]                                                         |
| J9  | File test di `src/pages/`                                                  | `tests/api/` [I2]                                                     |
| J10 | Mengedit `tokens.css` secara manual                                        | Ubah di Figma → `npm run tokens` [D4]                                 |
| J11 | `NODE_ENV` atau `process.env` untuk konfigurasi aplikasi                   | `astro:env` [K1, K3]                                                  |

## K. Environment dan deployment

**[K1] Env hanya lewat `astro:env`** dengan schema di `src/env.schema.ts`. Jangan membaca `process.env` atau `import.meta.env.<NAMA>` untuk variabel aplikasi.

**[K2] Kapan nilai dibaca:**

- `access: 'secret'` dibaca saat runtime. Dipakai untuk **semua nilai yang berbeda per environment** (URL backend, API key, strategi auth), termasuk yang sebenarnya tidak rahasia, supaya satu image bisa dipakai di dev, staging, dan production.
- `access: 'public'` di-inline saat build. Hanya untuk nilai yang tetap per build, misalnya `PUBLIC_BRAND`.

**[K3] Jangan mendefinisikan `NODE_ENV`** di schema; Astro dan Vite yang mengaturnya. Untuk cek mode, pakai `import.meta.env.DEV` atau `import.meta.env.PROD`.

**[K4] Menambah variabel env:** tambahkan di `env.schema.ts` dan `.env.example` dalam PR yang sama, lalu jalankan `npx astro sync` (atau restart dev server) supaya tipenya terbaca. `.env` tidak pernah di-commit.

**[K5] Docker:**

- Satu image per brand: `PUBLIC_BRAND` dikirim sebagai build arg. Nilai runtime dikirim lewat environment variable saat container dijalankan.
- Image mendengarkan `HOST=0.0.0.0`, port `4321`, dengan healthcheck ke `/api/health` [A7].
- Versi Node di `FROM` pada `Dockerfile` harus sama dengan `.nvmrc`. `.npmrc` (`engine-strict=true`) ikut disalin ke image.

---

## Keputusan terkait

- **Spacing:** skala bawaan Tailwind (kelipatan 4px). Angka Figma dibagi 4: padding 16 → `p-4`. Lihat `design-tokens/README.md`. (ADR-0009)
- **Brand per project:** ditentukan **saat build** lewat `PUBLIC_BRAND` (`astro:env`, build arg di Docker), dipasang sebagai `data-brand` di `<html>` oleh `base-layout.astro`. (ADR-0009)

## Ditunda

- **Pertanyaan untuk tim desain** (warna brand lama, Content/Disabled, oranye warning, kontras Content/Positive, Stroke/Tertiary dark, INAgov Secondary transparan, Secondary brand Neutral). Sementara ikuti `design-tokens/migration/legacy-color-map.json`; item berstatus review tetap dicek visual.
- **Rilis otomatis (release-please):** menunggu persetujuan PAT; workflow sementara hanya bisa dijalankan manual. Commit tetap wajib Conventional Commits supaya changelog bisa di-generate penuh dari riwayat saat diaktifkan.
- **`react/no-array-index-key`:** menunggu plugin React yang mendukung ESLint 10 [I3].
