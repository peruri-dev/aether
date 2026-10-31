# ADR-0006: Styling dengan Tailwind CSS v4

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks
Project acuan dan standar tim memakai Tailwind CSS. Klaim pixel perfect butuh satu sumber kebenaran untuk warna, spacing, dan tipografi. AI agent cenderung "mengejar" desain dengan nilai lepas (`p-[13px]`, `bg-[#1a2b3c]`) yang lama-lama membuat design system bocor.

## Keputusan
- Tailwind CSS v4 lewat `@tailwindcss/vite` (`npx astro add tailwind`). Tidak memakai `tailwind.config.js`.
- Satu CSS entry: `src/modules/common/styles/global.css`, di-import sekali di `base-layout.astro`.
- Design token didefinisikan di blok `@theme` pada file itu, sehingga token langsung menjadi utility class.
- **Arbitrary value dilarang** di class. Kebutuhan nilai baru diselesaikan dengan menambah token.
- Urutan class dirapikan `prettier-plugin-tailwindcss`. Kebenaran class (tidak dikenal, duplikat, konflik) diperiksa `eslint-plugin-better-tailwindcss`; aturan urutan dan pemenggalan baris di plugin itu dimatikan agar tidak bentrok dengan Prettier.

## Alternatif yang dipertimbangkan
- **CSS Modules / scoped style Astro**: tidak sesuai standar tim dan membuat token tersebar.
- **Tailwind v3 dengan `tailwind.config.js`**: versi lama; v4 berbasis CSS lebih ringkas dan didukung langsung oleh Astro.

## Konsekuensi
- Positif: token jadi sumber tunggal; tampilan konsisten antar modul; agent mudah dicek lewat lint.
- Negatif: desain yang benar-benar butuh nilai unik harus menambah token dulu (sedikit lebih lambat, tapi disengaja).
- Karena itu: larangan arbitrary value dipaksakan lewat ESLint di Fase 5.
