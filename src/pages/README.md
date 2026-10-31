# src/pages

Routing Astro. Setiap file di sini adalah satu URL.

## Isi folder ini
- File `.astro` yang memetakan URL ke **satu** komponen view dari `src/modules/`.
- Endpoint server di `api/` (proxy BFF, login/logout).

## Aturan
- Nama file dan folder: kebab-case (`user-management/index.astro`, `[id].astro`).
- File `.astro` hanya untuk routing, layout, dan meneruskan data server (misalnya `Astro.locals.user`, parameter route). **Tidak ada logika bisnis.**
- Satu halaman = satu island: `client:only="react"` dengan slot `fallback` berisi skeleton.
- Import modul hanya lewat public API-nya: `@/modules/<nama-modul>`, bukan path ke dalam folder modul.
- Halaman baru wajib didaftarkan di `src/modules/common/auth/route-permissions.ts`.

## Contoh
```astro
---
// src/pages/user-management/index.astro
import BaseLayout from '@/modules/common/layouts/base-layout.astro';
import { TableSkeleton } from '@/modules/common';
import { UserManagementView } from '@/modules/user-management';
const { user } = Astro.locals;
---
<BaseLayout title="Manajemen Pengguna" user={user}>
  <UserManagementView client:only="react" user={user}>
    <TableSkeleton slot="fallback" />
  </UserManagementView>
</BaseLayout>
```
