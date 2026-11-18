import { useEffect, useId, useState } from 'react';

import { cx } from '@/modules/common/styles/cx';

import FlowStation, { Shape } from './flow-node';
import {
  DIAGRAM,
  edgeEnds,
  edgePairKey,
  PACKET_FILL,
  PACKET_LEGEND,
} from '../constants/diagram';
import {
  GRID_LINES,
  SLAB_SHAPES,
  SLAB_TOP_POINTS,
} from '../constants/diagram-shapes';

import type { FlowStep, PacketMove } from '../types/flow';
import type React from 'react';

/** Urutan gambar stasiun: yang paling jauh (gx+gy terkecil) lebih dulu. */
const ORDERED_STATIONS = [...DIAGRAM.stations].sort(
  (a, b) => a.gx + a.gy - (b.gx + b.gy),
);

interface FlowPacketProps {
  move: PacketMove;
  reducedMotion: boolean;
}

/**
 * Satu packet yang berjalan di jalur diagonal antar stasiun. Mount di titik
 * start, lalu rAF mem-flip `launched` sehingga transition transform berjalan
 * dari style yang sudah ter-commit. Key memuat runId: Replay me-remount semua
 * packet sehingga animasi restart tanpa reset manual.
 */
function FlowPacket({
  move,
  reducedMotion,
}: Readonly<FlowPacketProps>): React.JSX.Element {
  const [launched, setLaunched] = useState(false);
  const { start, end } = edgeEnds(move.from, move.to);

  useEffect(() => {
    if (reducedMotion) {
      setLaunched(true);
      return;
    }
    const frame = requestAnimationFrame(() => setLaunched(true));
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const x = launched ? end.x : start.x;
  const y = launched ? end.y : start.y;

  return (
    <g
      className={cx(PACKET_FILL[move.kind], 'animate-packet-pulse')}
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

interface FlowDiagramProps {
  step: FlowStep;
  /** Dioper dari mesin flow; berubah saat replay agar semua packet di-remount. */
  runId: number;
  reducedMotion: boolean;
}

/** Scene SVG diorama isometrik: pelat, grid, jalur, stasiun, dan packet. */
export default function FlowDiagram({
  step,
  runId,
  reducedMotion,
}: Readonly<FlowDiagramProps>): React.JSX.Element {
  const titleId = useId();
  const descId = useId();
  const clipId = useId();
  const activeEdges = new Set(
    step.moves.map((move) => edgePairKey(move.from, move.to)),
  );

  return (
    <svg
      viewBox={`0 0 ${DIAGRAM.width} ${DIAGRAM.height}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className="h-auto w-full"
      focusable="false"
    >
      <title id={titleId}>
        Diagram alur request: pengguna, website, server, database
      </title>
      <desc id={descId}>
        Diorama isometrik: empat stasiun berdiri di atas pelat dasar, dari
        pengguna paling jauh hingga database paling dekat. Paket berwarna
        bergerak antar stasiun: request (kuning keemasan), response (hijau), dan
        handshake (biru).
      </desc>

      <defs>
        <clipPath id={clipId}>
          <polygon points={SLAB_TOP_POINTS} />
        </clipPath>
      </defs>

      {/* Pelat dasar scene + grid isometrik yang ter-clip di dalamnya. */}
      {SLAB_SHAPES.map((shape, index) => (
        <Shape
          key={`slab-${index}`}
          shape={shape}
          strokeClass="stroke-stroke-secondary"
        />
      ))}
      <g clipPath={`url(#${clipId})`}>
        {GRID_LINES.map((line, index) => (
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

      {/* Jalur antar stasiun: menyala saat ada packet melintas di langkah ini. */}
      {DIAGRAM.edges.map((edge) => {
        const { start, end } = edgeEnds(edge.from, edge.to);
        const isActive = activeEdges.has(edgePairKey(edge.from, edge.to));
        return (
          <line
            key={edge.id}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            strokeWidth={isActive ? 2 : 1.5}
            strokeDasharray={isActive ? '6 6' : undefined}
            strokeLinecap="round"
            className={
              isActive
                ? 'animate-trail-dash stroke-guide-500'
                : 'stroke-stroke-primary'
            }
          />
        );
      })}

      {/* Stasiun diorama, terurut kedalaman agar tumpang-tindihnya benar. */}
      {ORDERED_STATIONS.map((node) => (
        <FlowStation
          key={node.id}
          id={node.id}
          state={step.nodeStates[node.id]}
        />
      ))}

      {/* Packet terakhir agar berjalan di atas scene. */}
      {step.moves.map((move) => (
        <FlowPacket
          key={`${runId}-${move.from}-${move.to}-${move.kind}-${move.delayMs}`}
          move={move}
          reducedMotion={reducedMotion}
        />
      ))}
    </svg>
  );
}

/** Legend packet: dot warna + label teks (informasi tidak bergantung warna saja). */
export function FlowLegend(): React.JSX.Element {
  const kinds = Object.keys(PACKET_LEGEND) as Array<keyof typeof PACKET_LEGEND>;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {kinds.map((kind) => (
        <span
          key={kind}
          className="flex items-center gap-1.5 text-xs text-content-tertiary"
        >
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${PACKET_LEGEND[kind].dot}`}
          />
          {PACKET_LEGEND[kind].label}
        </span>
      ))}
    </div>
  );
}
