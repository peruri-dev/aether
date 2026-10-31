# src/modules

Satu folder = satu modul bisnis (screaming architecture). Nama folder adalah nama domain dalam kebab-case, misalnya `user-management`, `vendor`, `report`.

`common/` adalah modul khusus untuk kode yang dipakai lintas modul. Lihat `common/README.md`.

## Anatomi modul

```
user-management/
  api/          client, adapter (Zod -> tipe frontend), query keys, mutations
  components/   komponen modul ini, termasuk view per halaman
                  user-management-view.tsx
                  user-management-table.tsx
  hooks/        use-user-management.ts, use-user-mutations.ts
  schemas/      schema Zod untuk form dan respons API
  mocks/        handler MSW + fixtures
  types.ts
  index.ts      public API: hanya yang boleh dipakai dari luar
  README.md     keputusan khusus modul ini (opsional)
```

Tidak semua subfolder wajib ada; buat sesuai kebutuhan.

## Penamaan

- Semua file dan folder: **kebab-case**.
- Nama di dalam kode tetap mengikuti konvensi JS/TS: komponen PascalCase, hook dan fungsi camelCase.
  - `user-management-view.tsx` mengekspor `UserManagementView`
  - `use-user-management.ts` mengekspor `useUserManagement`
- Komponen yang di-mount oleh `src/pages` diberi akhiran `-view`.

## Aturan

- Boleh import dari `@/modules/common`. **Tidak boleh** import dari modul lain kecuali lewat `index.ts`-nya.
- Bentuk respons backend tidak boleh bocor ke komponen: selalu lewat adapter di `api/`.
- Filter, sort, dan pagination disimpan di URL.
- Modul baru dibuat dengan `npm run gen:module <nama>` lalu meniru golden module.

## Kapan sesuatu pindah ke common?

Hanya kalau dipakai oleh **dua modul atau lebih**. Sebelum itu, biarkan di dalam modul.
