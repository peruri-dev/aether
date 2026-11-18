/**
 * Matematika proyeksi isometrik 2:1 — varian cermin dari project acuan
 * (matrix(-1 -0.5 1 0.5) untuk bidang ground): sumbu ground +x mengarah
 * kiri-bawah layar, +y kanan-bawah, +z ke atas. Dengan ini muka depan objek
 * (bidang +gy) menghadap kanan-bawah penonton. Semua fungsi murni agar bisa
 * dites dan dihitung sekali sebagai konstanta, bukan saat render.
 * Dipakai bersama oleh semua lesson (system-flow, dashbent-login, dst.).
 */

export interface XY {
  x: number;
  y: number;
}

/** Titik ground: [gx, gy, gz]. */
export type IsoPoint = readonly [number, number, number?];

/** Proyeksikan satu titik ground ke koordinat layar (tanpa offset scene). */
export function iso(x: number, y: number, z: number = 0, offset?: XY): XY {
  const p = { x: y - x, y: (x + y) / 2 - z };
  return offset ? { x: p.x + offset.x, y: p.y + offset.y } : p;
}

/** Proyeksikan rangkaian titik ground menjadi atribut `points` polygon SVG. */
export function isoPoly(points: readonly IsoPoint[], offset?: XY): string {
  return points
    .map(([x, y, z]) => {
      const p = iso(x, y, z ?? 0, offset);
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

/** Tiga sisi terlihat sebuah kotak isometrik: atap, sisi kanan (+gx), sisi depan (+gy). */
export interface IsoFaces {
  top: string;
  right: string;
  left: string;
}

/**
 * Kotak dengan sudut ground (x, y), lebar w (arah gx), kedalaman d (arah gy),
 * tinggi h, berdiri di ketinggian z0.
 */
export function cuboid(
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  z0: number = 0,
  offset?: XY,
): IsoFaces {
  return {
    top: isoPoly(
      [
        [x, y, z0 + h],
        [x + w, y, z0 + h],
        [x + w, y + d, z0 + h],
        [x, y + d, z0 + h],
      ],
      offset,
    ),
    right: isoPoly(
      [
        [x + w, y, z0 + h],
        [x + w, y + d, z0 + h],
        [x + w, y + d, z0],
        [x + w, y, z0],
      ],
      offset,
    ),
    left: isoPoly(
      [
        [x, y + d, z0 + h],
        [x + w, y + d, z0 + h],
        [x + w, y + d, z0],
        [x, y + d, z0],
      ],
      offset,
    ),
  };
}

/**
 * Strip pembatas di dalam sebuah bidang depan (+gy) kotak: dipakai untuk garis
 * konten layar laptop, bar browser, dan ventilasi rack server.
 * (x, y, w) mendefinisikan plane; z1..z2 tinggi strip; inset masuk dari kedua sisi.
 */
export function frontStrip(
  x: number,
  y: number,
  w: number,
  z1: number,
  z2: number,
  inset: number = 0,
  offset?: XY,
): string {
  return isoPoly(
    [
      [x + inset, y, z2],
      [x + w - inset, y, z2],
      [x + w - inset, y, z1],
      [x + inset, y, z1],
    ],
    offset,
  );
}

export interface IsoEllipse extends XY {
  rx: number;
  ry: number;
}

/** Lingkaran berjari-jari r di bidang ground → ellipse layar rasio 2:1. */
export function isoEllipse(
  cx: number,
  cy: number,
  r: number,
  z: number = 0,
  offset?: XY,
): IsoEllipse {
  const p = iso(cx, cy, z, offset);
  return { ...p, rx: r * Math.SQRT2, ry: (r * Math.SQRT2) / 2 };
}

export interface IsoCylinder {
  top: IsoEllipse;
  /** Jalur `d` dinding silinder: bibir atas kiri turun, membulat di bawah, naik ke kanan. */
  side: string;
}

/** Silinder vertikal: pusat ground (cx, cy), jari-jari r, dari z0 setinggi h. */
export function cylinder(
  cx: number,
  cy: number,
  r: number,
  h: number,
  z0: number = 0,
  offset?: XY,
): IsoCylinder {
  const rim = isoEllipse(cx, cy, r, z0 + h, offset);
  const left = rim.x - rim.rx;
  const right = rim.x + rim.rx;
  const bottomY = rim.y + h;
  return {
    top: rim,
    // Arc sweep 0 dari kiri ke kanan melewati titik terbawah (y + ry) —
    // dinding membulat ke arah penonton.
    side: `M ${left} ${rim.y} L ${left} ${bottomY} A ${rim.rx} ${rim.ry} 0 0 0 ${right} ${bottomY} L ${right} ${rim.y} Z`,
  };
}

/**
 * Kunci palet warna scene. Union didefinisikan di sini agar bentuk tidak
 * bergantung modul palet; ISO_FILL di palette diverifikasi dengan
 * `satisfies Record<IsoFillKey, string>`.
 */
export type IsoFillKey =
  | 'slabTop'
  | 'slabSide'
  | 'gridLine'
  | 'platformTop'
  | 'platformSide'
  | 'platformSide2'
  | 'faceTop'
  | 'faceRight'
  | 'faceLeft'
  | 'detail'
  | 'screenTile'
  | 'led'
  | 'ledWarm'
  | 'ink'
  | 'figureShadow'
  | 'figureCloth1'
  | 'figureCloth2'
  | 'figureCloth3'
  | 'figureCloth4'
  | 'figureCloth5';

/**
 * Bentuk precomputed untuk dirender generik oleh DioramaStation.
 * `fill` adalah key ISO_FILL; `stroke` berarti digaris dengan warna stroke objek.
 */
export type IsoShape =
  | {
      kind: 'polygon';
      points: string;
      fill: IsoFillKey;
      stroke: boolean;
      opacity?: number;
    }
  | {
      kind: 'path';
      d: string;
      fill: IsoFillKey;
      stroke: boolean;
      opacity?: number;
    }
  | {
      kind: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      fill: IsoFillKey;
      stroke: boolean;
      opacity?: number;
    }
  | {
      kind: 'circle';
      cx: number;
      cy: number;
      r: number;
      fill: IsoFillKey;
      stroke: false;
    };

/** Potongan bentuk satu stasiun, sudah terurut dari yang paling belakang. */
export interface StationShapes {
  platform: IsoShape[];
  object: IsoShape[];
}

/** Segmen garis grid di bidang ground (koordinat layar). */
export interface LineSeg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
