# Migrasi token warna lama → token Figma

Project acuan memakai token warna buatan sendiri di `tailwind.css`. Boilerplate memakai token dari Figma (`tokens.css`). Folder ini berisi pemetaannya dan codemod untuk memindahkan komponen.

- `legacy-color-map.json`: pemetaan mesin (72 token lama), dipakai codemod dan skill healing.
- `scripts/migrate-legacy-colors.mjs`: codemod.

## Cara pakai saat porting komponen

```bash
# 1. salin komponen dari project acuan ke boilerplate
# 2. lihat laporannya dulu
node scripts/migrate-legacy-colors.mjs src/modules/common/components
# 3. terapkan
node scripts/migrate-legacy-colors.mjs src/modules/common/components --write
# 4. jaring pengaman: class lama yang tersisa akan error di sini
npm run lint
```

Codemod hanya dijalankan untuk komponen yang dibawa ke boilerplate, bukan untuk seluruh project lama.

## Lima kelompok hasil

| Status          | Jumlah | Artinya                                  | Tindakan                               |
| --------------- | ------ | ---------------------------------------- | -------------------------------------- |
| `same`          | 17     | Nama dan nilai sama                      | Tidak ada                              |
| `renamed`       | 16     | Nama baru, nilai sama atau hampir sama   | Diganti otomatis                       |
| `review`        | 23     | Nama baru, nilai atau perannya berbeda   | Diganti otomatis, **wajib cek visual** |
| `value-changed` | 8      | Nama sama, nilai berubah mengikuti Figma | Tidak diganti, **cek visual**          |
| `no-token`      | 8      | Tidak ada padanan                        | Putuskan manual                        |

## Yang paling berbahaya

1. **`background-primary`**. Di project lama nilainya navy gelap `#0C111D`; di Figma, `background-primary` adalah latar halaman putih. Class `bg-background-primary` tetap valid di kedua sistem, jadi **lint tidak akan menangkapnya**. Codemod mengganti ke `base-black`; cek setiap pemakaiannya.
2. **Token bernama sama dengan nilai berbeda** (`value-changed`). Lint juga tidak menangkapnya karena class-nya valid. Yang paling terasa:
   - `content-positive`: `#288034` → `#3CC14E` (lebih terang; kontras teks turun)
   - `stroke-secondary`: `#A3A3A3` → `#737373` (garis lebih gelap)
   - `negative-50`: `#FAFFFA` → `#FFFAFA` (nilai lama ternyata hijau, bug yang diperbaiki Figma)
3. **Warna brand lama (`ocean`, `blue-primary` `#2C37FF`) tidak ada di mode brand Figma mana pun.** Semua dipetakan ke `brand-*`, sehingga tampilannya mengikuti `data-brand`. Kalau project acuan harus tetap biru `#2C37FF`, tim desain perlu menambah mode brand baru.

## Ringkasan pemetaan

| Lama                                          | Baru                                     | Status           |
| --------------------------------------------- | ---------------------------------------- | ---------------- |
| `content-link`                                | `content-guide`                          | renamed          |
| `content-dark-secondary`                      | `neutral-200`                            | renamed          |
| `content-light-secondary`                     | `neutral-500`                            | review           |
| `content-disabled`                            | `neutral-300`                            | review           |
| `stroke-subtle`                               | `stroke-primary`                         | renamed          |
| `background-primary`                          | `base-black`                             | review           |
| `background-inverse`                          | `base-black`                             | renamed          |
| `background-sentiment-positive`               | `positive-50`                            | renamed          |
| `background-sentiment-negative`               | `negative-50`                            | renamed          |
| `overlay-primary`                             | `background-overlay`                     | renamed          |
| `primary-primary`                             | `brand-primary`                          | renamed          |
| `blue-primary`, `ocean-600`, `sidebar-active` | `brand-primary`                          | review           |
| `blue-100`, `ocean-50`                        | `brand-primary-50`                       | review           |
| `ocean-950`                                   | `brand-primary-900`                      | review           |
| `sidebar-box-active`                          | `brand-primary-25`                       | review           |
| `user-profile`                                | `brand-primary-300`                      | review           |
| `sentiment-info`                              | `guide-100`                              | renamed          |
| `sentiment-info-500`, `sentiment-guide-500`   | `guide-500`                              | review / renamed |
| `sentiment-{positive,negative,warning}-*`     | `{positive,negative,warning}-*`          | renamed / review |
| `sentiment-negative`, `sentiment-positive`    | `text-` → `content-*`, lainnya → `*-500` | renamed / review |
| `chart-user-distribution-1/2`                 | `chart-categorical-02/10`                | review           |
| `quick-action-*`, `gradient-banner-*`         | —                                        | no-token         |

Detail lengkap, termasuk nilai lama dan baru, ada di `legacy-color-map.json`.

## Untuk tim desain

- Tambahkan **Content/Disabled** (lama `#D5D7DA`).
- Tambahkan **warna oranye semantic** kalau peringatan oranye (`#F66A09`) masih dipakai; Figma hanya punya warning kuning.
- Konfirmasi **kontras `Content/Positive`** `#3CC14E` di atas putih untuk teks.
- Putuskan apakah warna brand lama `#2C37FF` perlu jadi **mode brand** sendiri.
- Gradien dekoratif (quick action, banner) belum punya token. Kalau dibutuhkan di boilerplate, jadikan collection tersendiri.

## Di luar cakupan warna

`tailwind.css` lama juga berisi animasi, `@utility` (`fullscreen-height`, `shimmer`), shadow, dan font. Itu bukan token Figma; bawa ke `src/modules/common/styles/` sebagai file terpisah (misalnya `animations.css`) dan jangan dicampur ke `tokens.css` yang di-generate. Shadow `ocean-glow` dan `focus-blue` memakai warna brand lama dalam `rgba`, jadi perlu ditulis ulang memakai token.
