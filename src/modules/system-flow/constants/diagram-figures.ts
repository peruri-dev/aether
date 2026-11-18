import { iso } from '@/modules/common/lesson/diorama/iso';
import type { IsoFillKey, IsoShape } from '@/modules/common/lesson/diorama/iso';

import { DIAGRAM } from './diagram';

import type { DiagramNode } from './diagram';

/**
 * Kerumunan figur orang kecil untuk stasiun pengguna — mengikuti gaya lesson
 * acuan yang menggambarkan pengguna sebagai massa orang (bayangan ellipse 2:1,
 * kapsul tubuh, kepala bulat), digambar di layar dengan jangkar titik ground.
 */

/** Rotasi warna pakaian figur: indigo, oranye, biru, hijau, ungu. */
const CLOTH_FILLS: readonly IsoFillKey[] = [
  'figureCloth1',
  'figureCloth2',
  'figureCloth3',
  'figureCloth4',
  'figureCloth5',
];

/** Warna pakaian figur ke-i (modulo palet), tanpa nilai undefined. */
function clothAt(index: number): IsoFillKey {
  const fill = CLOTH_FILLS[index % CLOTH_FILLS.length];
  if (!fill) {
    throw new Error('Palet pakaian figur kosong');
  }
  return fill;
}

/** Satu figur: bayangan, kapsul tubuh (busur atas & bawah), dan kepala. */
function person(gx: number, gy: number, cloth: IsoFillKey): IsoShape[] {
  const s = 1.15;
  const anchor = iso(gx, gy, DIAGRAM.platform.h, DIAGRAM.offset);
  const ax = anchor.x;
  const ay = anchor.y;
  const bw = 5.2 * s;
  return [
    {
      // bayangan lebih besar dari tubuh dan sedikit maju ke bawah agar
      // terlihat menganga di sekeliling kaki, bukan tersembunyi di baliknya
      kind: 'ellipse',
      cx: ax,
      cy: ay + 1.2 * s,
      rx: 7.2 * s,
      ry: 3.4 * s,
      fill: 'figureShadow',
      stroke: false,
      opacity: 0.3,
    },
    {
      kind: 'path',
      d:
        `M ${ax - bw} ${ay} L ${ax - bw} ${ay - 9 * s} ` +
        `A ${bw} ${bw} 0 0 1 ${ax + bw} ${ay - 9 * s} ` +
        `L ${ax + bw} ${ay} A ${bw} ${2.4 * s} 0 0 1 ${ax - bw} ${ay} Z`,
      fill: cloth,
      stroke: true,
    },
    {
      kind: 'ellipse',
      cx: ax,
      cy: ay - 17.6 * s,
      rx: 4.3 * s,
      ry: 4.3 * s,
      fill: 'detail',
      stroke: true,
    },
  ];
}

/**
 * Letak lima figur di atas pedestal, ground offset (dx, dy), terurut dari
 * belakang. Dipilih agar proyeksi layarnya membentuk bercak kerumunan dua
 * baris (2 belakang, 3 depan) — offset di sepanjang sumbu pandang akan
 * menumpuk menjadi satu kolom di layar.
 */
const CROWD_OFFSETS: readonly (readonly [number, number])[] = [
  [0, -14],
  [-14, 0],
  [13.5, -7.5],
  [3, 3],
  [-7.5, 13.5],
];

/** Bentuk kerumunan pengguna di atas pedestal stasinya. */
export function userCrowdShapes(node: DiagramNode): IsoShape[] {
  const cx = node.gx;
  const cy = node.gy;
  return CROWD_OFFSETS.flatMap(([dx, dy], index) =>
    person(cx + dx, cy + dy, clothAt(index)),
  );
}
