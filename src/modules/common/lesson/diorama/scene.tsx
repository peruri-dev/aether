import { useEffect, useId, useState } from 'react';

import { cx } from '@/modules/common/styles/cx';

import { DioramaShape, DioramaStation, DioramaStationCaption } from './station';

import type { CameraView } from './camera';
import type { IsoShape, LineSeg, XY } from './iso';
import type { StationSpec } from './station';
import type { NodeState, PacketMove } from '../types';
import type React from 'react';

/** Jalur edge yang sudah dipangkas ujungnya (koordinat layar). */
export interface EdgeSpec {
  id: string;
  from: string;
  to: string;
  start: XY;
  end: XY;
}

/** Move langkah ini, lengkap dengan koordinat layar ujung jalurnya. */
export type SceneMove = PacketMove & { start: XY; end: XY };

interface DioramaPacketProps {
  move: SceneMove;
  fillClass: string;
  reducedMotion: boolean;
}

/**
 * Satu packet yang berjalan di jalur diagonal antar stasiun. Mount di titik
 * start, lalu rAF mem-flip `launched` sehingga transition transform berjalan
 * dari style yang sudah ter-commit. Key memuat runId: replay me-remount semua
 * packet sehingga animasi restart tanpa reset manual.
 */
function DioramaPacket({
  move,
  fillClass,
  reducedMotion,
}: Readonly<DioramaPacketProps>): React.JSX.Element {
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setLaunched(true);
      return;
    }
    const frame = requestAnimationFrame(() => setLaunched(true));
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const x = launched ? move.end.x : move.start.x;
  const y = launched ? move.end.y : move.start.y;

  return (
    <g
      className={cx(fillClass, 'animate-packet-pulse')}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: reducedMotion
          ? 'none'
          : `transform ${move.durationMs}ms linear ${move.delayMs}ms`,
      }}
    >
      <rect x={-28} y={-12} width={56} height={24} rx={8} />
      <text
        x={0}
        y={3.5}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        className="fill-content-on-brand"
      >
        {move.kind}
      </text>
    </g>
  );
}

export interface DioramaSceneProps {
  width: number;
  height: number;
  /** Accessible name diagram (title) dan deskripsi naratif (desc). */
  title: string;
  desc: string;
  slabShapes: IsoShape[];
  slabTopPoints: string;
  gridLines: LineSeg[];
  /** Stasiun terurut kedalaman (painter's algorithm) oleh pemanggil. */
  stations: StationSpec[];
  /** Visual state tiap stasiun pada langkah aktif. */
  nodeStates: Record<string, NodeState>;
  edges: EdgeSpec[];
  /** Key edge yang menyala di langkah ini (pair key dari pemanggil). */
  activeEdgeKeys: ReadonlySet<string>;
  revealedNodes: ReadonlySet<string>;
  /** Move langkah ini, sudah memuat koordinat layar start/end. */
  moves: readonly SceneMove[];
  /** Map kind packet → class fill (mis. request → fill-warning-600). */
  packetFill: Readonly<Record<string, string>>;
  /** Dioper dari mesin flow; berubah saat replay agar semua packet di-remount. */
  runId: number;
  camera: CameraView;
  reducedMotion: boolean;
}

/** Scene SVG diorama isometrik: pelat, grid, jalur, stasiun, packet, kamera. */
export function DioramaScene({
  width,
  height,
  title,
  desc,
  slabShapes,
  slabTopPoints,
  gridLines,
  stations,
  nodeStates,
  edges,
  activeEdgeKeys,
  revealedNodes,
  moves,
  packetFill,
  runId,
  camera,
  reducedMotion,
}: Readonly<DioramaSceneProps>): React.JSX.Element {
  const titleId = useId();
  const descId = useId();
  const clipId = useId();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className="h-auto w-full"
      focusable="false"
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>

      <defs>
        <clipPath id={clipId}>
          <polygon points={slabTopPoints} />
        </clipPath>
      </defs>

      {/* Kamera adaptif: satu grup yang di-zoom/geser untuk membingkai hanya
          stasiun yang sudah muncul — close-up di awal, zoom-out tiap reveal. */}
      <g
        style={{
          transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
          transition: reducedMotion
            ? 'none'
            : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Pelat dasar scene + grid isometrik yang ter-clip di dalamnya. */}
        {slabShapes.map((shape, index) => (
          <DioramaShape
            key={`slab-${index}`}
            shape={shape}
            strokeClass="stroke-stroke-secondary"
          />
        ))}
        <g clipPath={`url(#${clipId})`}>
          {gridLines.map((line, index) => (
            <line
              key={`grid-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              strokeWidth={1}
              className="stroke-stroke-tertiary"
            />
          ))}
        </g>

        {/* Jalur antar stasiun: muncul bersama kedua ujungnya, menyala saat
            ada packet melintas di langkah ini. */}
        {edges.map((edge) => {
          const isActive = activeEdgeKeys.has(
            [edge.from, edge.to].sort().join('-'),
          );
          const visible =
            revealedNodes.has(edge.from) && revealedNodes.has(edge.to);
          return (
            <line
              key={edge.id}
              x1={edge.start.x}
              y1={edge.start.y}
              x2={edge.end.x}
              y2={edge.end.y}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={isActive ? '6 6' : undefined}
              strokeLinecap="round"
              className={
                isActive
                  ? 'animate-trail-dash stroke-guide-500'
                  : 'stroke-stroke-primary'
              }
              style={{
                opacity: visible ? 1 : 0,
                transition: reducedMotion ? 'none' : 'opacity 450ms ease',
              }}
            />
          );
        })}

        {/* Stasiun diorama, sudah terurut kedalaman agar tumpang-tindihnya benar. */}
        {stations.map((spec) => (
          <DioramaStation
            key={spec.id}
            spec={spec}
            state={nodeStates[spec.id] ?? 'idle'}
            visible={revealedNodes.has(spec.id)}
            reducedMotion={reducedMotion}
          />
        ))}

        {/* Caption (label + pill) di lapisan tersendiri di atas semua tubuh
            stasiun, agar teks tidak pernah tertutup pedestal/objek stasiun
            lain. Urutan animasi reveal tetap sinkron dengan tubuhnya. */}
        {stations.map((spec) => (
          <DioramaStationCaption
            key={`caption-${spec.id}`}
            spec={spec}
            state={nodeStates[spec.id] ?? 'idle'}
            visible={revealedNodes.has(spec.id)}
            reducedMotion={reducedMotion}
          />
        ))}

        {/* Packet terakhir agar berjalan di atas scene. */}
        {moves.map((move) => (
          <DioramaPacket
            key={`${runId}-${move.from}-${move.to}-${move.kind}-${move.delayMs}`}
            move={move}
            fillClass={packetFill[move.kind] ?? 'fill-content-tertiary'}
            reducedMotion={reducedMotion}
          />
        ))}
      </g>
    </svg>
  );
}

/** Legend packet: dot warna + label teks (informasi tidak bergantung warna saja). */
export function DioramaLegend({
  entries,
}: Readonly<{
  entries: readonly { dot: string; label: string }[];
}>): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {entries.map((entry) => (
        <span
          key={entry.label}
          className="flex items-center gap-1.5 text-xs text-content-tertiary"
        >
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${entry.dot}`}
          />
          {entry.label}
        </span>
      ))}
    </div>
  );
}
