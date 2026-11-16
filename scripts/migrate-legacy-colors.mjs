#!/usr/bin/env node
/**
 * Codemod: ganti class/variabel warna lama (tailwind.css project acuan) ke token Figma.
 *
 * Usage:
 *   node scripts/migrate-legacy-colors.mjs <path...>           # dry-run: laporan saja
 *   node scripts/migrate-legacy-colors.mjs <path...> --write   # terapkan perubahan
 *
 * Contoh: node scripts/migrate-legacy-colors.mjs src/modules/common/components --write
 *
 * Mapping: design-tokens/migration/legacy-color-map.json
 * Yang diubah:
 *   - class Tailwind warna, termasuk varian (hover:, lg:, dark:) dan opacity (/50)
 *   - var(--color-<lama>) di CSS, style, atau string TS
 * Yang hanya dilaporkan: token "value-changed" (nama sama, nilai berubah), "no-token",
 * dan hex literal yang nilainya sama dengan token lama.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const args = process.argv.slice(2);
const write = args.includes('--write');
const targets = args.filter((a) => !a.startsWith('--'));
if (targets.length === 0) {
  console.error(
    'Usage: node scripts/migrate-legacy-colors.mjs <path...> [--write]',
  );
  process.exit(1);
}

const { tokens } = JSON.parse(
  readFileSync(
    join(process.cwd(), 'design-tokens/migration/legacy-color-map.json'),
    'utf8',
  ),
);

const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.astro',
  '.css',
  '.mdx',
]);
const PREFIXES = [
  'bg',
  'text',
  'border',
  'border-x',
  'border-y',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-s',
  'border-e',
  'divide',
  'outline',
  'ring',
  'ring-offset',
  'fill',
  'stroke',
  'from',
  'via',
  'to',
  'decoration',
  'accent',
  'caret',
  'placeholder',
  'shadow',
  'inset-shadow',
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Longest names first so "sentiment-negative-50" wins over "sentiment-negative"
const names = Object.keys(tokens).sort((a, b) => b.length - a.length);
const prefixes = [...PREFIXES].sort((a, b) => b.length - a.length);

const classRe = new RegExp(
  `(?<![\\w-])((?:[\\w\\[\\]&:@/.-]+:)*!?)(${prefixes.map(esc).join('|')})-(${names.map(esc).join('|')})(?=/|[^\\w-]|$)`,
  'g',
);
const varRe = new RegExp(`var\\(--color-(${names.map(esc).join('|')})\\)`, 'g');
const legacyHex = new Map(
  Object.entries(tokens)
    .filter(([, t]) => /^#[0-9a-f]{6}/i.test(t.old ?? ''))
    .map(([name, t]) => [t.old.slice(0, 7).toUpperCase(), name]),
);

function files(path) {
  const st = statSync(path);
  if (st.isFile()) return EXTENSIONS.has(extname(path)) ? [path] : [];
  return readdirSync(path)
    .filter((f) => !['node_modules', 'dist', '.astro'].includes(f))
    .flatMap((f) => files(join(path, f)));
}

const report = {
  changed: [],
  review: [],
  valueChanged: [],
  noToken: [],
  hex: [],
};
let fileCount = 0;

for (const file of targets.flatMap(files)) {
  const rel = relative(process.cwd(), file);
  const src = readFileSync(file, 'utf8');
  const lineOf = (i) => src.slice(0, i).split('\n').length;

  let out = src.replace(classRe, (match, variants, prefix, name, offset) => {
    const t = tokens[name];
    const where = `${rel}:${lineOf(offset)}`;
    if (t.status === 'same') return match;
    if (t.status === 'value-changed') {
      report.valueChanged.push(`${where}  ${match}  (${t.old} → ${t.new})`);
      return match;
    }
    if (t.status === 'no-token' || !t.to) {
      report.noToken.push(`${where}  ${match}`);
      return match;
    }
    const to = t.byPrefix?.[prefix] ?? t.to;
    const next = `${variants}${prefix}-${to}`;
    (t.status === 'review' ? report.review : report.changed).push(
      `${where}  ${match} → ${next}`,
    );
    return next;
  });

  out = out.replace(varRe, (match, name, offset) => {
    const t = tokens[name];
    const where = `${rel}:${lineOf(offset)}`;
    if (!t.to || t.status === 'no-token') {
      report.noToken.push(`${where}  ${match}`);
      return match;
    }
    if (t.status === 'same' || t.status === 'value-changed') return match;
    const next = `var(--color-${t.to})`;
    (t.status === 'review' ? report.review : report.changed).push(
      `${where}  ${match} → ${next}`,
    );
    return next;
  });

  for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const name = legacyHex.get(m[0].toUpperCase());
    if (name)
      report.hex.push(
        `${rel}:${lineOf(m.index)}  ${m[0]}  (= token lama "${name}")`,
      );
  }

  if (out !== src) {
    fileCount++;
    if (write) writeFileSync(file, out);
  }
}

const section = (title, items) => {
  if (!items.length) return;
  console.log(`\n## ${title} (${items.length})`);
  for (const i of items) console.log(`  ${i}`);
};

console.log(
  `# Migrasi warna ${write ? '(DITERAPKAN)' : '(dry-run, tambahkan --write untuk menerapkan)'}`,
);
console.log(`${fileCount} file ${write ? 'diubah' : 'akan diubah'}`);
section('Diganti otomatis', report.changed);
section('Diganti, WAJIB cek visual (nilai/peran berbeda)', report.review);
section(
  'Nama tetap, nilai berubah mengikuti Figma (cek visual)',
  report.valueChanged,
);
section('Tidak ada token pengganti (putuskan manual)', report.noToken);
section(
  'Hex literal yang sama dengan token lama (ganti manual ke class token)',
  report.hex,
);
