import { useEffect, useId, useState } from 'react';

import { cx } from '@/modules/common/styles/cx';

import {
  DIAGRAM,
  edgeEnds,
  edgePairKey,
  NODE_STYLE,
  PACKET_FILL,
  PACKET_LEGEND,
} from '../constants/diagram';

import type {
  FlowStep,
  NodeId,
  NodeState,
  PacketKind,
  PacketMove,
} from '../types/flow';
import type React from 'react';

interface NodeGlyphProps {
  id: NodeId;
  x: number;
  y: number;
  glyphClass: string;
}

/** Glyph geometris sederhana per node (garis, tanpa fill). */
function NodeGlyph({
  id,
  x,
  y,
  glyphClass,
}: Readonly<NodeGlyphProps>): React.JSX.Element {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={glyphClass}
    >
      {id === 'user' ? (
        <>
          <circle cx={0} cy={-9} r={5} />
          <path d="M -10 12 Q 0 0 10 12" />
        </>
      ) : null}
      {id === 'app' ? (
        <>
          <rect x={-15} y={-12} width={30} height={24} rx={3} />
          <path d="M -15 -5 L 15 -5" />
        </>
      ) : null}
      {id === 'server' ? (
        <>
          <rect x={-15} y={-14} width={30} height={11} rx={2} />
          <rect x={-15} y={3} width={30} height={11} rx={2} />
          <path d="M -11 -8.5 L -11 -8.5" />
          <path d="M -11 8.5 L -11 8.5" />
        </>
      ) : null}
      {id === 'database' ? (
        <>
          <ellipse cx={0} cy={-10} rx={13} ry={5} />
          <path d="M -13 -10 L -13 10 A 13 5 0 0 0 13 10 L 13 -10" />
          <path d="M -13 0 A 13 5 0 0 0 13 0" />
        </>
      ) : null}
    </g>
  );
}

interface FlowPacketProps {
  move: PacketMove;
  reducedMotion: boolean;
}

/**
 * Satu packet yang berjalan di edge. Mount di titik start, lalu rAF mem-flip
 * `launched` sehingga transition transform berjalan dari style yang sudah
 * ter-commit. Key memuat runId, jadi Replay me-remount dan animasi restart.
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

/** Scene SVG diagram alur: edge, node, ping ring, dan packet yang bergerak. */
export default function FlowDiagram({
  step,
  runId,
  reducedMotion,
}: Readonly<FlowDiagramProps>): React.JSX.Element {
  const titleId = useId();
  const descId = useId();
  const activeEdges = new Set(
    step.moves.map((move) => edgePairKey(move.from, move.to)),
  );

  return (
    <svg
      viewBox={`${-DIAGRAM.overflowPad} 0 ${DIAGRAM.width + DIAGRAM.overflowPad * 2} ${DIAGRAM.height}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className="h-auto w-full"
      focusable="false"
    >
      <title id={titleId}>
        Diagram alur request: pengguna, website, server, database
      </title>
      <desc id={descId}>
        Empat simpul tersambung dari kiri ke kanan. Paket berwarna bergerak
        antar simpul: request (kuning keemasan), response (hijau), dan handshake
        (biru).
      </desc>

      {/* Jalur antar node: menyala saat ada packet melintas di langkah ini. */}
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

      {/* Ping ring di node yang sedang bekerja. */}
      {DIAGRAM.nodes.map((node) => {
        if (step.nodeStates[node.id] !== 'active') return null;
        return (
          <circle
            key={`ping-${node.id}`}
            cx={node.x}
            cy={DIAGRAM.centerY}
            r={54}
            fill="none"
            strokeWidth={1.5}
            className="animate-node-ping stroke-guide-500"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        );
      })}

      {/* Kotak node + glyph + label, plus pil keterangan di bawahnya. */}
      {DIAGRAM.nodes.map((node) => {
        const state: NodeState = step.nodeStates[node.id];
        const style = NODE_STYLE[state];
        const left = node.x - DIAGRAM.nodeWidth / 2;
        const top = DIAGRAM.centerY - DIAGRAM.nodeHeight / 2;

        return (
          <g key={node.id}>
            <rect
              x={left}
              y={top}
              width={DIAGRAM.nodeWidth}
              height={DIAGRAM.nodeHeight}
              rx={12}
              strokeWidth={state === 'active' ? 2 : 1.5}
              className={style.box}
            />
            <NodeGlyph
              id={node.id}
              x={node.x}
              y={DIAGRAM.centerY - 14}
              glyphClass={style.glyph}
            />
            <text
              x={node.x}
              y={DIAGRAM.centerY + 28}
              textAnchor="middle"
              fontSize={14}
              fontWeight={600}
              className={style.label}
            >
              {node.label}
            </text>
            <rect
              x={left}
              y={DIAGRAM.centerY + DIAGRAM.nodeHeight / 2 + 12}
              width={DIAGRAM.nodeWidth}
              height={24}
              rx={12}
              strokeWidth={1}
              className="fill-background-tertiary stroke-stroke-primary"
            />
            <text
              x={node.x}
              y={DIAGRAM.centerY + DIAGRAM.nodeHeight / 2 + 28}
              textAnchor="middle"
              fontSize={10}
              className="fill-content-tertiary"
            >
              {node.sub}
            </text>
          </g>
        );
      })}

      {/* Packet terakhir agar berjalan di atas node. */}
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
  const kinds = Object.keys(PACKET_LEGEND) as PacketKind[];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {kinds.map((kind) => (
        <span
          key={kind}
          className="flex items-center gap-1.5 text-xs text-content-tertiary"
        >
          <span
            aria-hidden="true"
            className={cx('size-2.5 rounded-full', PACKET_LEGEND[kind].dot)}
          />
          {PACKET_LEGEND[kind].label}
        </span>
      ))}
    </div>
  );
}
