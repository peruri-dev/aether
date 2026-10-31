# ADR-0003: Auth berbasis strategi dan proxy BFF

- Status: Diterima
- Tanggal: 2026-10-31

## Konteks

Backend antar project memakai metode auth berbeda (mayoritas JWT, sebagian SSO dan session cookie). Menyimpan token di browser (localStorage) rentan XSS. Project sudah memakai server Node lewat adapter Astro.

## Keputusan

- Semua metode auth diakses lewat satu kontrak `AuthStrategy` (`login`, `getSession`, `refresh`, `logout`, `authorize`), dipilih lewat env `AUTH_STRATEGY`. Implementasi awal: `jwt` dan `mock`.
- Token disimpan di cookie `httpOnly`, `Secure`, `SameSite=Lax`. React tidak pernah menyentuh token.
- Browser hanya memanggil `/api/*` di Astro (BFF), yang menempelkan auth dan meneruskan ke backend.
- `src/middleware.ts` mengecek sesi dan permission sebelum halaman dirender; peta permission tunggal ada di `route-permissions.ts`.
- Refresh token dijalankan sekali per sesi meski banyak request paralel menerima 401.

## Alternatif yang dipertimbangkan

- **Token di localStorage, browser memanggil backend langsung**: lebih sederhana, tapi rentan XSS dan memerlukan CORS.
- **Implementasi JWT tanpa kontrak**: cepat, tapi project SSO berikutnya memaksa mengubah middleware dan proxy.

## Konsekuensi

- Positif: lebih aman; tanpa CORS; ganti metode auth cukup menambah satu strategi.
- Negatif: satu hop tambahan per request; server Node harus selalu hidup; ada perlindungan CSRF yang wajib dijaga (`security.checkOrigin`, mutasi non-GET).
- Karena itu: agent yang mengerjakan fitur biasa tidak boleh mengubah folder auth (tercantum di AGENTS.md).
