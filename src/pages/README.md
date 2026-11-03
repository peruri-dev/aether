# src/pages

Routing Astro. Setiap file di sini adalah satu URL. Lihat juga `docs/CONVENTIONS.md` bagian C.

## Isi folder ini

- `<modul>/index.astro`, `<modul>/[id].astro`: halaman, sejajar dengan `src/modules/<modul>/` [A5].
- `api/<resource>/index.ts`: endpoint BFF [A6].

## Aturan halaman `.astro`

- Hanya pekerjaan server: guard spesifik resource, prefetch data, redirect [C1]. Tidak ada UI interaktif.
- Satu halaman = satu view dengan `client:only="react"` dan slot `fallback` berisi skeleton [C2].
- Props ke view hanya data aman dan serializable. **Token tidak pernah dioper ke React** [C3].
- Impor view lewat public API modul: `@/modules/<modul>`; kode prefetch lewat `@/modules/<modul>/server` [A3].
- Tangkap `RedirectError` dan ubah menjadi `Astro.redirect` [G1].

```astro
---
// src/pages/projects/[id].astro
import BaseLayout from '@/modules/common/layouts/base-layout.astro';
import TableSkeleton from '@/modules/common/components/table-skeleton';
import { ProjectDetailView } from '@/modules/projects';
import { fetchProjectServer } from '@/modules/projects/server'; // khusus server

const { id } = Astro.params;
if (!id) return Astro.redirect('/404');

const project = await fetchProjectServer(Astro, id);
const { user } = Astro.locals;
---

<BaseLayout title="Detail Project">
  <ProjectDetailView client:only="react" project={project} user={user}>
    <TableSkeleton slot="fallback" />
  </ProjectDetailView>
</BaseLayout>
```

## Aturan endpoint `api/`

- Baca token dari cookie lewat `context.cookies`; urus refresh token di sini, bukan di klien [E2].
- Bungkus seluruh handler dengan try/catch; error tak terduga → `errorResponse({ status: 500 })` [G3].
- Respons selalu `BackendResponse<T>` lewat `dataResponse` / `errorResponse` [E3].
- Secret dan URL backend dari `astro:env/server`.
