# src/modules/common

Kode yang dipakai lintas modul dan tidak mengenal domain bisnis apa pun.

## Isi folder ini
| Folder | Isi |
| --- | --- |
| `components/` | Design system: komponen dasar yang di-styling dengan token |
| `styles/` | `tokens.css` (sumber tunggal warna, spacing, tipografi) dan style global |
| `layouts/` | Layout Astro, misalnya `base-layout.astro` |
| `providers/` | `with-app-providers.tsx`, query client, error boundary |
| `api/` | API client ke BFF dan tipe `ApiError` |
| `auth/` | `AuthStrategy`, session, `route-permissions.ts`, `use-current-user.ts`, `can.tsx` |
| `lib/` | Util murni (format tanggal, storage, dll.) |

## Aturan
- Nama file dan folder: kebab-case (`date-picker.tsx` mengekspor `DatePicker`).
- `common` **tidak boleh** import dari modul lain atau dari `src/pages`.
- Tidak ada istilah domain bisnis di sini (tidak ada `User`, `Vendor`, dst.).
- Warna dan spacing hanya dari token; tidak ada nilai hex atau px lepas di komponen.
- Sebelum membuat komponen baru, cek apakah sudah ada di `components/`. Komponen baru wajib punya story di Storybook.
- `fetch` langsung hanya boleh di `api/`.
