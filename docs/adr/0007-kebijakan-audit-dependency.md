# ADR-0007: Kebijakan audit keamanan dependency

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks
Setelah tooling dasar dipasang, `npm audit` melaporkan 15 temuan moderate. Semuanya berasal dari satu celah DoS di `minimatch` (diperbaiki di 11.0.1) yang dipakai rantai tooling ESLint (devDependencies). ESLint 10 belum memakai minimatch 11, sehingga `npm audit fix --force` menyarankan turun ke `eslint@4.0.0`, yang akan merusak seluruh konfigurasi lint.

## Keputusan
- **Gerbang CI hanya untuk dependency produksi:** `npm audit --omit=dev --audit-level=high`. CI gagal bila ada celah high/critical pada kode yang ikut ke server.
- **Temuan di devDependencies dianalisis, bukan dipaksa.** Ditunggu perbaikan dari upstream dan diterima lewat update rutin (Renovate/Dependabot).
- **`npm audit fix --force` dilarang.**
- `overrides` di `package.json` hanya dipakai bila diwajibkan kebijakan atau syarat kontrak, wajib lolos `npm run lint` dan dicatat dengan ADR baru, lalu dihapus begitu upstream memperbaiki.

## Analisis temuan saat ini (minimatch)
- Hanya ada di tooling lint; tidak ikut ke build produksi.
- Eksploitasi butuh pola glob dari penyerang; pola glob di repo ini berasal dari konfigurasi kita sendiri.
- Kesimpulan: risiko praktis dapat diabaikan. Ditinjau ulang setiap ada update ESLint.

## Alternatif yang dipertimbangkan
- **`npm audit fix --force`**: menurunkan ESLint ke versi 4; ditolak.
- **Audit seluruh dependency sebagai gerbang CI**: CI akan merah karena hal di luar kendali kita dan tidak relevan bagi produksi; ditolak.

## Konsekuensi
- Positif: CI fokus pada risiko nyata; laporan audit produksi bisa dilampirkan untuk tender.
- Negatif: `npm audit` tanpa flag masih menampilkan temuan dev; perlu dijelaskan merujuk ADR ini.
