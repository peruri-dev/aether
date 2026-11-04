# Changelog

Semua perubahan penting pada boilerplate ini dicatat di file ini.

Format mengikuti prinsip [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), dan versi mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Entri dibuat otomatis oleh release-please dari commit Conventional Commits di `main`. Perubahan yang belum dirilis bisa dilihat di release PR yang sedang terbuka.

Perubahan pada `.claude/skills/` dan `AGENTS.md` mengubah perilaku AI agent, jadi selalu dicatat seperti perubahan kode (scope `skills`).

## [0.1.0] - 2026-11-04

Rilis fondasi. Belum ada auth, layout, dan modul contoh; belum disarankan untuk project baru.

### Added

- Astro (adapter Node, on-demand rendering) + React 19 + Tailwind CSS v4.
- Tooling: TypeScript strictest, ESLint 10 dengan batas modul dan aturan ketat, Prettier, husky + lint-staged + commitlint.
- CI: lint, format, `astro check`, test, build, audit dependency produksi, cek sinkronisasi design tokens.
- Design tokens dari Figma: generator `npm run tokens`, multi-brand (`data-brand`) dan light/dark (`data-theme`).
- Codemod migrasi warna dari project lama (`scripts/migrate-legacy-colors.mjs`).
- Util dasar `common`: `cx`, `ApiError`/`RedirectError`, `text()` bilingual, `dataResponse`/`errorResponse`, `fetchApi`, konstanta rute.
- Environment: schema `astro:env`, `.env.example`, Dockerfile multi-stage dengan healthcheck `/api/health`.
- Vitest + Testing Library.
- Dokumentasi: `AGENTS.md`, `docs/CONVENTIONS.md`, ADR 0001–0009, README per folder.
