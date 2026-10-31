# Design tokens

Sumber kebenaran warna dan radius adalah **Figma**. Repo hanya menyimpan hasil export-nya, lalu men-generate CSS untuk Tailwind.

```
design-tokens/figma/
  primitives/          Primary.tokens.json          palet mentah
  brand/               BGN, BKN, INAgov, LAN, Neutral, PANRB .tokens.json
  product/             Light.tokens.json, Dark.tokens.json
  data-visualization/  Mode 1.tokens.json
        │
        ▼  npm run tokens   (scripts/build-tokens.mjs)
src/modules/common/styles/tokens.css   ← AUTO-GENERATED, jangan diedit
src/modules/common/styles/global.css   ← @import tailwindcss + tokens.css
```

## Memperbarui token

1. Tim desain export ulang variable dari Figma (per collection, per mode).
2. Timpa file di folder yang sesuai. Brand baru cukup ditambah sebagai file baru di `brand/`.
3. Jalankan `npm run tokens`, baca peringatan di terminal, lalu commit JSON dan `tokens.css` bersamaan.
4. Commit dengan `feat(tokens): ...` atau `fix(tokens): ...` agar tercatat di changelog.

## Empat lapisan

| Lapisan            | Variabel CSS    | Jadi utility class? | Berganti lewat             |
| ------------------ | --------------- | ------------------- | -------------------------- |
| Primitives         | `--primitive-*` | **Tidak**           | -                          |
| Brand              | `--brand-*`     | Ya, `*-brand-*`     | `<html data-brand="bgn">`  |
| Product            | `--product-*`   | Ya                  | `<html data-theme="dark">` |
| Data visualization | -               | Ya, `*-chart-*`     | -                          |

Palet bawaan Tailwind (`blue-500`, `gray-100`, dan seterusnya) **dihapus**. Class yang tidak ada di daftar di bawah ini tidak akan ter-generate, dan ESLint akan menandainya.

## Aturan pakai (urutan prioritas)

1. **Token semantic product dulu.** Pilih berdasarkan peran, bukan warna:
   - Latar: `bg-background-primary | secondary | tertiary`, overlay `bg-background-overlay`
   - Teks/ikon: `text-content-primary | secondary | tertiary | guide | negative | positive`
   - Garis: `border-stroke-primary | secondary | tertiary`
   - `bg-base-white`, `text-base-black` (ikut terbalik di dark mode)
2. **Warna brand** untuk aksen identitas instansi: `bg-brand-primary`, `text-brand-primary-600`, `bg-brand-secondary-100`, dan seterusnya (skala 25–900).
3. **Skala status** saat butuh variasi: `neutral-25…900`, `guide-50…900` (info), `negative-*`, `positive-*`, `warning-*`.
4. **Chart**: `chart-single-primary`, `chart-set-01…07` (sekuensial), `chart-categorical-01…10`. Di library chart, pakai `var(--color-chart-categorical-01)`.
5. **Jangan** memakai `--primitive-*` langsung di komponen, dan jangan arbitrary value (`bg-[#0956C3]`). Kalau butuh warna yang tidak ada, minta tim desain menambah token.

Karena token product sudah berganti sendiri saat `data-theme="dark"`, komponen hampir tidak perlu prefix `dark:`.

## Radius dan spacing

- Radius mengikuti Figma: `rounded-4`, `rounded-8`, `rounded-12`, `rounded-16`, `rounded-24`, `rounded-32`, `rounded-full`. Radius bawaan Tailwind (`rounded-md`, dan sebagainya) dihapus.
- Ketebalan stroke ikon: `var(--icon-stroke-24)`, `var(--icon-stroke-20)`, `var(--icon-stroke-16)`.
- Spacing memakai skala bawaan Tailwind (kelipatan 4px), jadi **angka Figma dibagi 4**:

| Figma    | 4   | 8   | 12  | 16  | 24  | 32  | 40   | 48   | 56   | 64   | 80   |
| -------- | --- | --- | --- | --- | --- | --- | ---- | ---- | ---- | ---- | ---- |
| Tailwind | `1` | `2` | `3` | `4` | `6` | `8` | `10` | `12` | `14` | `16` | `20` |

Contoh: padding Figma 16 → `p-4`; gap 24 → `gap-6`.

## Brand dan theme

Atur di `<html>` pada `base-layout.astro`:

```astro
<html lang="id" data-brand="inagov" data-theme="light">
```

Tanpa atribut, default-nya `neutral` dan `light` (diatur di `scripts/build-tokens.mjs`). Brand per project sebaiknya diambil dari env, misalnya `PUBLIC_BRAND` lewat `astro:env`.

## Temuan yang perlu dikonfirmasi ke tim desain

- **INAgov Secondary** 25, 50, 800, dan 900 bernilai putih transparan (alpha 0); 800 dan 900 juga ditandai "Do Not Use" tapi tetap dipakai di mode brand INAgov.
- **Brand Neutral, Secondary** merujuk palet `BKN/Secondary` (biru BKN). Disengaja atau salah rujuk?
- **Dark, Stroke/Tertiary** = `#1F1F1F` di atas `Background/Primary` dark `#141414`: kontrasnya nyaris nol.
- **Content/Positive** sama di light dan dark (`Green/500`), sementara Guide dan Negative memakai versi lebih terang di dark.
- Palet **INApas** dan **INAku** ada di primitives tapi belum punya mode brand.
- Nama collection **"Oppacity"** (typo "Opacity"). Tidak berpengaruh ke kode, hanya ke nama variabel primitive.
