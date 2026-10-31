# ADR-0004: Tangga state management

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks

Project acuan belum memakai state management. Karena tiap halaman adalah island terpisah (ADR-0001), state di memori hilang setiap navigasi. Tanpa aturan, agent cenderung memasang store global dan menyimpan data server di sana.

## Keputusan

Pilih anak tangga paling bawah yang cukup:

1. **Server state** dengan TanStack Query: cache, refetch, invalidasi setelah mutasi. Respons divalidasi Zod lewat adapter.
2. **URL state**: filter, sort, pagination, tab.
3. **Form state**: React Hook Form + Zod.
4. **State lokal** komponen: `useState`.
5. **State lintas island** (jarang): nanostores.

## Alternatif yang dipertimbangkan

- **Store global (Redux/Zustand) untuk semuanya**: menduplikasi data server dan rawan tidak sinkron; tidak membantu karena store hilang tiap navigasi.

## Konsekuensi

- Positif: tampilan tabel bisa di-share dan bertahan saat refresh; lebih sedikit bug sinkronisasi.
- Negatif: data di-fetch ulang per halaman.
- Karena itu: kalau terasa lambat, cache TanStack Query boleh dipersist ke sessionStorage (butuh ADR baru jika diadopsi).
