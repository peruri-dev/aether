# ADR-0008: Public API modul lewat `index.ts`

- Status: Diterima
- Tanggal: 2026-11-02
- Menggantikan: bagian "impor antar modul" di ADR-0002

## Konteks

Project acuan melarang impor antar modul sama sekali; kode yang dipakai lintas modul harus naik ke `common`. Analisis konvensi menemukan efek sampingnya: empat pasang service, schema, hook, dan konstanta yang disalin antar modul lalu berkembang berbeda (salah satunya schema 38 baris vs 221 baris untuk hal yang sama), serta satu komponen yang diam-diam diimpor dari modul fitur lain. Saat modul A butuh kode **domain** milik modul B, larangan total hanya menyisakan dua pilihan buruk: mengotori `common` dengan istilah bisnis, atau menyalin kode.

## Keputusan

- Setiap modul boleh punya `index.ts` sebagai **public API**: named export yang dipilih, tanpa `export *`, dan hanya kode yang aman untuk browser.
- Kode khusus server (prefetch, pemanggil backend) diekspor lewat `server.ts` terpisah, yang hanya boleh diimpor dari `.astro` dan `src/pages/api`. Ini mencegah kode server terbawa ke bundle browser.
- Modul lain dan `src/pages` hanya boleh mengimpor modul lewat `@/modules/<modul>`. Deep import ke dalam modul lain dilarang.
- Di dalam modul sendiri, pakai path relatif.
- `common` diimpor langsung per file dan tidak punya `index.ts`.
- Kode generik (tanpa istilah domain) tetap naik ke `common`; kode domain tetap di modul pemiliknya dan dibagikan lewat `index.ts`.
- Dipaksakan oleh ESLint: `no-restricted-imports` (pola `@/modules/*/*` kecuali `common` dan `*/server`; `*/server` dilarang dari `.tsx`) dan `import/no-cycle`.

## Alternatif yang dipertimbangkan

- **Larangan total (pola project acuan):** sudah terbukti di 25 modul, tapi terbukti juga menghasilkan duplikasi.
- **Bebas deep import:** paling mudah, tapi batas modul hilang dan refaktor internal bisa merusak modul lain.

## Konsekuensi

- Positif: tidak ada alasan menyalin kode; `common` tetap netral; isi internal modul bebas direfaktor.
- Negatif: ada ketergantungan antar modul yang perlu dijaga agar tidak melingkar; `index.ts` harus dirawat.
- Risiko barrel memperlambat dev server ditekan dengan larangan `export *` dan tanpa barrel di `common`.
