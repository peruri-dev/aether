# Architecture Decision Records (ADR)

ADR adalah catatan singkat tentang **satu keputusan arsitektur**: apa yang diputuskan, kenapa, dan apa konsekuensinya. Tujuannya supaya orang (dan AI agent) yang datang belakangan tidak perlu menebak alasan di balik struktur kode, dan tidak membongkar keputusan yang sudah dipikirkan matang.

## Aturan main

- Satu file = satu keputusan. Nama file: `NNNN-judul-kebab-case.md`.
- Salin `0000-template.md` untuk ADR baru, nomor urut berikutnya.
- ADR yang sudah **Diterima tidak diedit isinya**. Kalau keputusan berubah, buat ADR baru dan ubah status yang lama menjadi `Digantikan oleh ADR-NNNN`. Riwayatnya tetap utuh.
- Tulis ADR saat keputusan diambil, bukan berbulan-bulan kemudian. Cukup 1 halaman.
- Kapan perlu ADR? Kalau keputusan itu mahal diubah, memengaruhi banyak file, atau akan ditanyakan orang lain ("kenapa tidak pakai X?").

## Status

`Diusulkan` → `Diterima` → (`Usang` | `Digantikan oleh ADR-NNNN`)

## Daftar

| No                                          | Judul                                       | Status   |
| ------------------------------------------- | ------------------------------------------- | -------- |
| [0001](0001-astro-shell-react-app.md)       | Astro sebagai shell, React sebagai aplikasi | Diterima |
| [0002](0002-struktur-modul-dan-penamaan.md) | Struktur modul dan penamaan kebab-case      | Diterima |
| [0003](0003-auth-strategy-dan-bff.md)       | Auth berbasis strategi dan proxy BFF        | Diterima |
| [0004](0004-tangga-state-management.md)     | Tangga state management                     | Diterima |
| [0005](0005-tooling-dasar.md)               | Tooling dasar: npm, Node 24, ESLint 10      | Diterima |
| [0006](0006-styling-tailwind-v4.md)         | Styling dengan Tailwind CSS v4              | Diterima |
| [0007](0007-kebijakan-audit-dependency.md)  | Kebijakan audit keamanan dependency         | Diterima |
