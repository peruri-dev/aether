# src/modules

Satu folder = satu modul bisnis (screaming architecture), nama kebab-case: `users`, `projects`, `reports`.
`common/` adalah modul khusus untuk kode lintas modul tanpa istilah domain. Aturan lengkap: `docs/CONVENTIONS.md` bagian A, B, E.

## Anatomi modul [A2]

```
projects/
  components/   project-detail-view.tsx, project-table.tsx, project-form-dialog.tsx
  services/     fetch-projects.ts, fetch-project-by-id.ts, submit-project.ts
  hooks/        use-project-filters.ts
  schemas/      project.schema.ts
  types/        project.ts
  constants/    project-status.ts
  utils/        format-project-code.ts
  mocks/        handler MSW + fixtures
  index.ts      public API modul (aman untuk browser)
  server.ts     public API khusus server: prefetch untuk .astro dan api/ (opsional)
```

Minimal `components/` dan `services/`; sisanya dibuat sesuai kebutuhan.

## Impor [A3] (ADR-0008)

| Dari                         | Ke                    | Cara                                                    |
| ---------------------------- | --------------------- | ------------------------------------------------------- |
| Mana pun                     | `common`              | Langsung per file: `@/modules/common/components/button` |
| Modul lain atau `src/pages`  | Modul ini             | Hanya lewat `@/modules/<modul>`                         |
| Di dalam modul sendiri       | —                     | Path relatif: `../services/fetch-projects`              |
| `.astro` dan `src/pages/api` | Kode server modul ini | `@/modules/<modul>/server` (dilarang dari `.tsx`)       |

```ts
// src/modules/users/index.ts
// Named export saja, tanpa `export *`, hanya kode yang aman untuk browser.
export { default as UsersView } from './components/users-view';
export { default as UserAvatar } from './components/user-avatar';
export { fetchUserById } from './services/fetch-user-by-id';
export type { User, UserRole } from './types/user';
```

## Kapan naik ke `common`? [A4]

Tanyakan: _apakah kode ini masuk akal di aplikasi dengan domain lain?_

- Ya, dan dipakai dua modul atau lebih → pindahkan ke `common` sekarang.
- Tidak (mengandung aturan domain) → tetap di modul pemilik, ekspor lewat `index.ts`.
- **Jangan pernah menyalin** kode antar modul.

## Penamaan [B]

- File: kebab-case. Komponen PascalCase, hook dan fungsi camelCase di dalam kode.
- Komponen: akhiran peran (`-view`, `-dialog`, `-form`, `-table`, `-list`, `-item`, `-card`, `-filter`).
- Service: `<kata-kerja>-<resource>.ts` (`fetch-` untuk membaca).
- Schema: `<subjek>.schema.ts`; tipe form dari `z.infer`.
- Komponen modul: `export default function`, props `Readonly<<Nama>Props>`, return `React.ReactNode`.

## Data [E]

- Komponen → service → `fetch('/api/...')`. Tanpa token, tanpa `fetch` ke backend langsung.
- State dengan `useState`; filter, sort, pagination di URL. Jangan tambah library state tanpa ADR.
