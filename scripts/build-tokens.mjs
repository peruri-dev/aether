#!/usr/bin/env node
/**
 * Generate src/modules/common/styles/tokens.css from Figma variable exports.
 *
 * Input (export Figma per collection per mode, drop the files into these folders):
 *   design-tokens/figma/primitives/*.tokens.json          raw palettes (not exposed as utilities)
 *   design-tokens/figma/brand/<Brand>.tokens.json         one file per brand mode
 *   design-tokens/figma/product/{Light,Dark}.tokens.json  semantic product tokens
 *   design-tokens/figma/data-visualization/*.tokens.json  chart palettes
 *
 * Usage: npm run tokens
 * No dependencies. Re-run whenever the design team re-exports.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'design-tokens/figma');
const OUT = join(ROOT, 'src/modules/common/styles/tokens.css');

/** Brand used when <html> has no data-brand attribute. */
const DEFAULT_BRAND = 'neutral';
/** Product mode used when <html> has no data-theme attribute. */
const DEFAULT_THEME = 'light';

const warnings = [];

// ---------- helpers ----------

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const pathSlug = (path) => path.map(slug).join('-');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function filesIn(dir) {
  const full = join(SRC, dir);
  if (!existsSync(full)) throw new Error(`Folder tidak ditemukan: ${full}`);
  return readdirSync(full)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => join(full, f));
}

/** Walk a Figma DTCG export and yield [pathArray, token]. */
function* walk(node, path = []) {
  if (node && typeof node === 'object' && '$value' in node) {
    yield [path, node];
    return;
  }
  for (const [key, value] of Object.entries(node ?? {})) {
    if (key.startsWith('$')) continue;
    yield* walk(value, [...path, key]);
  }
}

const modeName = (json, file) =>
  json.$extensions?.['com.figma.modeName'] ??
  basename(file).replace(/\.tokens\.json$/, '');

const aliasName = (token) =>
  token.$extensions?.['com.figma.aliasData']?.targetVariableName;

const toHex = (n) =>
  Math.round(Math.min(1, Math.max(0, n)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

function colorLiteral(value) {
  const alpha = value.alpha ?? 1;
  const hex =
    value.hex?.toUpperCase() ?? `#${value.components.map(toHex).join('')}`;
  return alpha >= 1 ? hex : `${hex}${toHex(alpha)}`;
}

const pxValue = (n) => (n === 0 ? '0' : `${Number(n.toFixed(3))}px`);

// ---------- 1. primitives ----------

const primitiveVars = new Map(); // figma name "Blue/500" -> css var name
const primitiveDecls = [];

for (const file of filesIn('primitives')) {
  for (const [path, token] of walk(readJson(file))) {
    if (token.$type !== 'color') continue; // numeric primitives are resolved inline
    const figmaName = path.join('/');
    const varName = `--primitive-${pathSlug(path)}`;
    primitiveVars.set(figmaName, varName);
    const literal = colorLiteral(token.$value);
    if ((token.$value.alpha ?? 1) === 0)
      warnings.push(`Primitive transparan (alpha 0): ${figmaName}`);
    primitiveDecls.push(`  ${varName}: ${literal};`);
  }
}

/** Resolve a semantic color token to var(--primitive-...) when it is an alias, else a literal. */
function resolveColor(token, context) {
  const target = aliasName(token);
  if (target) {
    if (/do not use/i.test(target))
      warnings.push(`${context} merujuk primitive "${target}"`);
    const varName = primitiveVars.get(target);
    if (varName) return `var(${varName})`;
    warnings.push(
      `${context}: alias "${target}" tidak ditemukan di primitives, memakai nilai literal`,
    );
  }
  return colorLiteral(token.$value);
}

// ---------- 2. brands ----------

const brandBlocks = [];
const brandThemeNames = new Set();

for (const file of filesIn('brand')) {
  const json = readJson(file);
  const brand = slug(modeName(json, file));
  const decls = [];
  for (const [path, token] of walk(json)) {
    if (token.$type !== 'color') continue;
    // "Primary/Primary" is the brand's main color -> --brand-primary
    const name =
      path.length === 2 && slug(path[0]) === slug(path[1])
        ? slug(path[0])
        : pathSlug(path);
    brandThemeNames.add(name);
    decls.push(
      `  --brand-${name}: ${resolveColor(token, `Brand ${brand} ${path.join('/')}`)};`,
    );
  }
  const isDefault = brand === DEFAULT_BRAND;
  const selector = isDefault
    ? `:root,\n[data-brand='${brand}']`
    : `[data-brand='${brand}']`;
  // Default first: same specificity, so later blocks must be able to override it
  brandBlocks[isDefault ? 'unshift' : 'push'](
    `${selector} {\n${decls.join('\n')}\n}`,
  );
}

// ---------- 3. product (light / dark) ----------

const productBlocks = [];
const productThemeNames = new Set();
let radiusDecls = [];
let iconStrokeDecls = [];

for (const file of filesIn('product')) {
  const json = readJson(file);
  const mode = slug(modeName(json, file));
  const decls = [];
  const radius = [];
  const iconStroke = [];
  for (const [path, token] of walk(json)) {
    const key = pathSlug(path);
    if (token.$type === 'color') {
      productThemeNames.add(key);
      decls.push(
        `  --product-${key}: ${resolveColor(token, `Product ${mode} ${path.join('/')}`)};`,
      );
    } else if (token.$type === 'number') {
      const group = slug(path.at(-2) ?? '');
      const leaf = path.at(-1);
      if (group === 'corner-radius') {
        const size = /r$/i.test(leaf) ? 'full' : leaf.match(/\d+/)?.[0];
        radius.push(`  --radius-${size}: ${pxValue(token.$value)};`);
      } else if (group === 'icon-stroke') {
        const size = leaf.match(/\d+/)?.[0];
        iconStroke.push(`  --icon-stroke-${size}: ${pxValue(token.$value)};`);
      }
      // Spacing/horizontal follows Tailwind's default 4px scale; see design-tokens/README.md
    }
  }
  if (mode === DEFAULT_THEME) {
    radiusDecls = radius;
    iconStrokeDecls = iconStroke;
  }
  const isDefault = mode === DEFAULT_THEME;
  const selector = isDefault
    ? `:root,\n[data-theme='${mode}']`
    : `[data-theme='${mode}']`;
  productBlocks[isDefault ? 'unshift' : 'push'](
    `${selector} {\n  color-scheme: ${mode};\n${decls.join('\n')}\n}`,
  );
}

// ---------- 4. data visualization ----------

const chartTheme = [];
for (const file of filesIn('data-visualization')) {
  for (const [path, token] of walk(readJson(file))) {
    if (token.$type !== 'color') continue;
    const parts = path.map(slug).map((p) => p.replace(/-data$/, '')); // "Set Data" -> "set"
    chartTheme.push(
      `  --color-${parts.join('-')}: ${resolveColor(token, `Chart ${path.join('/')}`)};`,
    );
  }
}

chartTheme.sort();

// ---------- 5. write ----------

const sorted = (set) => [...set];
const css = `/*
 * AUTO-GENERATED oleh scripts/build-tokens.mjs dari design-tokens/figma/.
 * JANGAN diedit manual. Ubah di Figma, export ulang, lalu jalankan: npm run tokens
 *
 * Lapisan:
 *   1. --primitive-*  palet mentah, TIDAK menjadi utility class
 *   2. --brand-*      berganti lewat <html data-brand="..."> (default: ${DEFAULT_BRAND})
 *   3. --product-*    berganti lewat <html data-theme="light|dark"> (default: ${DEFAULT_THEME})
 *   4. @theme         yang boleh dipakai komponen sebagai utility class
 */

/* ---------- 1. Primitives ---------- */
:root {
${primitiveDecls.join('\n')}
}

/* ---------- 2. Brand ---------- */
${brandBlocks.join('\n\n')}

/* ---------- 3. Product ---------- */
${productBlocks.join('\n\n')}

:root {
${iconStrokeDecls.join('\n')}
}

/* ---------- 4. Tailwind theme ---------- */
@theme inline {
  /* Hapus palet bawaan Tailwind: komponen hanya boleh memakai token di bawah ini */
  --color-*: initial;
  --radius-*: initial;

  /* Product (semantic, ikut light/dark) */
${sorted(productThemeNames)
  .map((n) => `  --color-${n}: var(--product-${n});`)
  .join('\n')}

  /* Brand (ikut data-brand) */
${sorted(brandThemeNames)
  .map((n) => `  --color-brand-${n}: var(--brand-${n});`)
  .join('\n')}

  /* Data visualization */
${chartTheme.join('\n')}

  /* Corner radius */
${radiusDecls.join('\n')}
}
`;

writeFileSync(OUT, css);
console.log(`✔ tokens.css ditulis: ${OUT}`);
console.log(
  `  ${primitiveVars.size} primitive, ${brandThemeNames.size} brand × ${brandBlocks.length} brand, ` +
    `${productThemeNames.size} product × ${productBlocks.length} mode, ${chartTheme.length} chart`,
);
if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} peringatan (konfirmasi ke tim desain):`);
  for (const w of [...new Set(warnings)]) console.warn(`  - ${w}`);
}
