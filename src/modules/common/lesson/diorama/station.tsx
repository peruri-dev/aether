import { useEffect, useState } from 'react';

import { cx } from '@/modules/common/styles/cx';

import { ISO_FILL } from './palette';

import type { IsoEllipse, IsoShape, StationShapes, XY } from './iso';
import type { NodeState } from '../types';
import type React from 'react';

/** Class garis dan teks node per visual state. */
export const NODE_STYLE: Record<
  NodeState,
  { stroke: string; label: string; sub: string }
> = {
  idle: {
    stroke: 'stroke-stroke-tertiary',
    label: 'fill-content-secondary',
    sub: 'fill-content-tertiary',
  },
  active: {
    stroke: 'stroke-guide-500',
    label: 'fill-content-primary',
    sub: 'fill-content-secondary',
  },
  done: {
    stroke: 'stroke-stroke-secondary',
    label: 'fill-content-primary',
    sub: 'fill-content-secondary',
  },
};

interface ShapeProps {
  shape: IsoShape;
  strokeClass: string;
}

/** Render satu bentuk isometrik precomputed dengan warna dari token. */
export function DioramaShape({
  shape,
  strokeClass,
}: Readonly<ShapeProps>): React.JSX.Element {
  const stroke = shape.stroke
    ? {
        className: strokeClass,
        strokeWidth: 1.2,
        strokeLinejoin: 'round' as const,
      }
    : {};
  const opacity =
    shape.kind === 'circle' || shape.opacity === undefined
      ? undefined
      : shape.opacity;

  if (shape.kind === 'polygon') {
    return (
      <polygon
        points={shape.points}
        fill={ISO_FILL[shape.fill]}
        opacity={opacity}
        {...stroke}
      />
    );
  }
  if (shape.kind === 'path') {
    return (
      <path
        d={shape.d}
        fill={ISO_FILL[shape.fill]}
        opacity={opacity}
        {...stroke}
      />
    );
  }
  if (shape.kind === 'ellipse') {
    return (
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={ISO_FILL[shape.fill]}
        opacity={opacity}
        {...stroke}
      />
    );
  }
  return (
    <circle
      cx={shape.cx}
      cy={shape.cy}
      r={shape.r}
      fill={ISO_FILL[shape.fill]}
    />
  );
}

/** Data satu stasiun yang sudah precomputed di constants lesson. */
export interface StationSpec {
  id: string;
  label: string;
  sub: string;
  /** Pusat atas pedestal, dalam koordinat layar. */
  screen: XY;
  ping: IsoEllipse;
  shapes: StationShapes;
  labelGap: number;
  pill: { w: number; h: number };
  /** Label dan pill di atas objek, bukan di bawah pedestal (stasiun baris belakang). */
  labelAbove?: boolean;
  /**
   * Geser caption dari pusat pedestal, untuk caption yang akan menginjak
   * pedestal/objek stasiun tetangga bila tetap di tengah.
   */
  captionOffset?: XY | undefined;
}

interface DioramaStationProps {
  spec: StationSpec;
  state: NodeState;
  /** False selama stasiun belum di-reveal: tersembunyi dan tak terbaca screen reader. */
  visible: boolean;
  reducedMotion: boolean;
}

/**
 * Reveal progresif: stasiun jatuh dari atas dengan overshoot (emulasi spring
 * acuan: mulai -64px, melewati posisi akhir sedikit, lalu settle). Pola dua
 * fase rAF (seperti packet) agar drop ikut berjalan saat load pertama, bukan
 * hanya saat reveal antar langkah; terputus saat reduced motion.
 */
function useDropReveal(visible: boolean, reducedMotion: boolean): boolean {
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDropped(false);
      return;
    }
    if (reducedMotion) {
      setDropped(true);
      return;
    }
    const frame = requestAnimationFrame(() => setDropped(true));
    return () => cancelAnimationFrame(frame);
  }, [visible, reducedMotion]);

  return visible && dropped;
}

/** Gaya grup reveal yang sama untuk tubuh stasiun dan caption-nya. */
function dropStyle(
  shown: boolean,
  reducedMotion: boolean,
): React.CSSProperties {
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(-64px)',
    transition: reducedMotion
      ? 'none'
      : 'opacity 450ms ease, transform 620ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
}

/**
 * Tubuh satu stasiun diorama: cincin ping (bila aktif), pedestal, dan objek.
 * Label serta pill digambar terpisah oleh DioramaStationCaption di lapisan
 * atas scene, supaya teks tidak pernah tertutup pedestal atau objek stasiun
 * lain (painter's algorithm antar baris).
 */
export function DioramaStation({
  spec,
  state,
  visible,
  reducedMotion,
}: Readonly<DioramaStationProps>): React.JSX.Element {
  const style = NODE_STYLE[state];
  const shown = useDropReveal(visible, reducedMotion);

  return (
    <g
      data-node-id={spec.id}
      aria-hidden={!visible}
      style={dropStyle(shown, reducedMotion)}
    >
      {state === 'active' ? (
        <ellipse
          cx={spec.ping.x}
          cy={spec.ping.y}
          rx={spec.ping.rx}
          ry={spec.ping.ry}
          fill="none"
          strokeWidth={1.5}
          className={cx('animate-node-ping', style.stroke)}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ) : null}
      {spec.shapes.platform.map((shape, index) => (
        <DioramaShape
          key={`platform-${index}`}
          shape={shape}
          strokeClass={style.stroke}
        />
      ))}
      {spec.shapes.object.map((shape, index) => (
        <DioramaShape
          key={`object-${index}`}
          shape={shape}
          strokeClass={style.stroke}
        />
      ))}
    </g>
  );
}

interface DioramaStationCaptionProps {
  spec: StationSpec;
  state: NodeState;
  visible: boolean;
  reducedMotion: boolean;
}

/**
 * Caption satu stasiun: label dan pill keterangan. Default di bawah pedestal;
 * `labelAbove` membalik ke atas objek untuk stasiun baris belakang yang zona
 * bawahnya dipakai stasiun baris depan. Animasi reveal sama dengan tubuhnya.
 */
export function DioramaStationCaption({
  spec,
  state,
  visible,
  reducedMotion,
}: Readonly<DioramaStationCaptionProps>): React.JSX.Element {
  const style = NODE_STYLE[state];
  const shown = useDropReveal(visible, reducedMotion);
  const captionX = spec.screen.x + (spec.captionOffset?.x ?? 0);
  const labelY =
    (spec.labelAbove
      ? spec.screen.y - spec.labelGap
      : spec.screen.y + spec.labelGap) + (spec.captionOffset?.y ?? 0);
  const pillY = spec.labelAbove ? labelY - 14 - spec.pill.h : labelY + 14;

  return (
    <g aria-hidden={!visible} style={dropStyle(shown, reducedMotion)}>
      <text
        x={captionX}
        y={labelY}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        className={style.label}
      >
        {spec.label}
      </text>
      <rect
        x={captionX - spec.pill.w / 2}
        y={pillY}
        width={spec.pill.w}
        height={spec.pill.h}
        rx={spec.pill.h / 2}
        strokeWidth={1}
        className="fill-background-tertiary stroke-stroke-primary"
      />
      <text
        x={captionX}
        y={pillY + spec.pill.h / 2 + 3.5}
        textAnchor="middle"
        fontSize={10}
        className={style.sub}
      >
        {spec.sub}
      </text>
    </g>
  );
}
