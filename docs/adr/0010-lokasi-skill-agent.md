# ADR-0010: Lokasi skill AI agent yang netral terhadap tool

- Status: Diterima
- Tanggal: 2026-11-16

## Konteks

Aether menyimpan instruksi untuk AI agent dalam bentuk skill (`SKILL.md`: frontmatter `name` dan `description`, lalu instruksi). Skill pertama, `ui-contract`, berasal dari tim QA. Developer dan project turunan tidak selalu memakai agent yang sama; selain Claude Code, ada Codex, Cursor, Copilot, dan tool lain. Folder `.claude/skills/` hanya dibaca otomatis oleh Claude Code, dan jalur yang dibaca otomatis oleh tiap tool berbeda dan masih berubah.

## Keputusan

- Sumber utama skill ada di **`.agents/skills/<nama-skill>/SKILL.md`**. Hanya file di sini yang diedit.
- `.claude/skills` adalah **symlink** ke `../.agents/skills`, supaya Claude Code memuatnya secara native.
- **`AGENTS.md` memuat tabel semua skill** (nama, kapan dipakai, path file) dan instruksi untuk membaca `SKILL.md` yang relevan sebelum bekerja. Ini jalur penemuan untuk agent yang tidak mendukung skill secara native.
- `CLAUDE.md` hanya berisi `@AGENTS.md`.
- Skill ditulis tanpa bergantung pada fitur khusus satu tool. Instruksi yang hanya berlaku untuk tool tertentu ditandai eksplisit.
- Skill yang berasal dari tim lain mencatat sumber, pemilik, dan tanggal sinkron di bawah frontmatter.

## Alternatif yang dipertimbangkan

- **Hanya `.claude/skills/`:** paling sederhana, tapi mengikat boilerplate ke satu tool.
- **Salinan terpisah per tool** (`.claude/`, `.cursor/`, `.github/`, dan seterusnya): tiap tool terlayani, tapi isi akan saling menyimpang.
- **Script sinkronisasi (`npm run skills:sync`) + cek CI** sebagai pengganti symlink: aman di Windows tanpa konfigurasi, tapi menambah satu langkah dan satu pengecekan. Dipakai kalau symlink terbukti bermasalah di tim.

## Konsekuensi

- Positif: satu sumber kebenaran; semua agent menemukan skill yang sama lewat `AGENTS.md`.
- Negatif: symlink di Git butuh `core.symlinks=true`, dan di Windows juga butuh Developer Mode atau hak admin. Tanpa itu, symlink muncul sebagai file teks berisi path.
- Karena itu: syarat symlink ditulis di README; setiap skill baru wajib ditambahkan ke tabel di `AGENTS.md` dalam PR yang sama.
