# ADR-0002: Struktur modul dan penamaan kebab-case

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks

Kode perlu mudah ditemukan dan ditiru, oleh manusia maupun AI agent. Struktur berbasis jenis file (`components/`, `hooks/` di root) membuat satu fitur tersebar ke banyak folder.

## Keputusan

- Screaming architecture: `src/modules/<nama-modul>/` berisi semua milik satu modul bisnis (`api`, `components`, `hooks`, `schemas`, `mocks`, `index.ts`).
- Kode lintas modul tinggal di `src/modules/common/`.
- Arah dependency satu arah: `pages` → `modules/<modul>` → `modules/common`. Antar modul hanya lewat `index.ts`.
- Sesuatu pindah ke `common` hanya jika dipakai dua modul atau lebih.
- Semua nama file dan folder **kebab-case**. Di dalam kode tetap PascalCase untuk komponen dan camelCase untuk hook/fungsi. Komponen yang di-mount oleh `src/pages` diberi akhiran `-view`.

## Alternatif yang dipertimbangkan

- **Struktur per jenis file**: lebih familiar, tapi fitur tersebar dan sulit dihapus atau dipindah utuh.
- **PascalCase untuk file komponen**: umum di React, tapi rawan masalah case-sensitivity antara macOS dan Linux (CI).

## Konsekuensi

- Positif: "buat modul baru" berarti "buat satu folder yang meniru golden module"; modul bisa dihapus utuh.
- Negatif: butuh disiplin agar `common` tidak jadi tempat sampah.
- Karena itu: aturan boundaries dan `unicorn/filename-case` dipaksakan lewat ESLint (Fase 5).
