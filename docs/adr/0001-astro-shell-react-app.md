# ADR-0001: Astro sebagai shell, React sebagai aplikasi

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks

Standar tech-stack frontend perusahaan adalah Astro. Boilerplate ini dipakai untuk dashboard dan sistem internal yang hampir seluruhnya interaktif dan berada di balik login, sehingga keunggulan Astro untuk situs konten (HTML statis, SEO) tidak banyak terpakai. Project acuan sudah terbukti rapi dengan pola `.astro` untuk routing dan komponen React (`.tsx`) untuk UI.

## Keputusan

- Astro dengan adapter Node (on-demand rendering) menangani routing, layout, middleware auth, dan endpoint BFF.
- Seluruh UI interaktif ditulis dengan React.
- Setiap halaman me-mount **satu** komponen view React dengan `client:only="react"` dan slot `fallback` berisi skeleton.
- File `.astro` tidak boleh berisi logika bisnis.

## Alternatif yang dipertimbangkan

- **SPA murni (Vite + React)**: lebih alami untuk dashboard, tapi tidak sesuai standar perusahaan.
- **Island kecil dengan `client:load`/`client:visible` dan SSR React**: menambah risiko hydration mismatch dan kompleksitas, tanpa manfaat berarti untuk halaman di balik login.

## Konsekuensi

- Positif: sesuai standar perusahaan; auth dan permission dicek di server sebelum halaman dikirim; batas `.astro` vs React jelas untuk agent.
- Negatif: setiap navigasi adalah full page load, sehingga state React dan cache TanStack Query dibuat ulang per halaman; ada layar skeleton sebelum JS siap.
- Karena itu: state yang perlu bertahan disimpan di URL atau storage (lihat ADR-0004); provider dibungkus lewat `withAppProviders` di setiap view.
