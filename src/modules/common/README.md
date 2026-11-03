# src/modules/common

Kode yang dipakai lintas modul dan tidak mengenal domain bisnis apa pun. Diimpor **langsung per file**; folder ini sengaja tidak punya `index.ts`.

## Isi folder ini

| Folder        | Isi                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `components/` | Design system: primitif dan komponen generik (`button.tsx`, `toast.tsx`, `dialog.tsx`)                |
| `hooks/`      | Hook generik (`use-pagination.ts`, `use-flash-toast-param.ts`)                                        |
| `services/`   | Helper fetch dan respons (`fetch-api-helpers.ts`: `BackendResponse`, `dataResponse`, `errorResponse`) |
| `utils/`      | Fungsi murni (`error.ts`: `ApiError`, `RedirectError`; format tanggal; storage)                       |
| `styles/`     | `global.css`, `tokens.css` (di-generate, jangan diedit), `cx.ts`                                      |
| `layouts/`    | `base-layout.astro`                                                                                   |
| `auth/`       | `route-permissions.ts` (peta rute + permission, satu sumber), `use-current-user.ts`, `can.tsx`        |

## Aturan

- `common` **tidak boleh** import dari modul lain atau dari `src/pages`.
- Tidak ada istilah domain bisnis di sini (tidak ada `User`, `Project`, `Invoice`, dan sebagainya).
- Primitif: named export, ekspor varian dan tipe props (`export { Button, buttonVariants, type ButtonProps }`), varian dengan `tailwind-variants` [B7, D2].
- Gabung class lewat `cx()`; warna dan radius hanya dari token; tidak ada hex atau arbitrary value [D1, D4].
- Sebelum membuat komponen baru, cek apakah sudah ada di `components/`. Komponen baru wajib punya story di Storybook.
