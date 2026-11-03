# ADR-0009: Pemilihan brand per project dan skala spacing

- Status: Diterima
- Tanggal: 2026-11-03

## Konteks

Token Figma (ADR-0006) punya beberapa mode brand (BGN, BKN, INAgov, LAN, Neutral, PANRB) dan skala spacing kelipatan 4px. Setiap project hasil boilerplate hanya memakai satu brand, dan brand-nya ditentukan per deployment. Skala spacing Figma (4, 8, 12, …, 80) cocok dengan skala bawaan Tailwind yang berbasis 4px.

## Keputusan

- Brand dipilih lewat env `PUBLIC_BRAND` yang didefinisikan di schema `astro:env` sebagai enum (`context: 'client'`, `access: 'public'`, default `neutral`).
- `base-layout.astro` memasang nilainya sebagai atribut `data-brand` di `<html>`. Komponen tidak pernah membaca `PUBLIC_BRAND` langsung; mereka cukup memakai class `brand-*`.
- Daftar nilai enum harus sama dengan nama file di `design-tokens/figma/brand/` (huruf kecil). Menambah brand berarti menambah file token dan nilai enum dalam PR yang sama.
- Spacing memakai skala bawaan Tailwind tanpa modifikasi. Angka Figma dibagi 4 (Figma 16 → `p-4`).

## Alternatif yang dipertimbangkan

- **Brand di-hardcode di layout:** sederhana, tapi satu codebase tidak bisa dipakai untuk beberapa instansi.
- **Brand dipilih saat runtime oleh user:** tidak dibutuhkan; brand mengikuti instansi pemilik aplikasi.
- **Spacing 1px (`--spacing: 1px`, Figma 16 → `p-16`):** angka sama persis dengan Figma, tapi menyimpang dari konvensi Tailwind yang dikenal developer dan AI agent (`w-64` jadi 64px, bukan 256px).

## Konsekuensi

- Positif: satu boilerplate untuk semua instansi; ganti brand cukup lewat env saat deploy; konvensi spacing standar Tailwind.
- Negatif: developer perlu membagi angka Figma dengan 4; tabel konversinya ada di `design-tokens/README.md`.
- Karena itu: schema `astro:env` dan daftar file brand harus dijaga tetap sinkron.
