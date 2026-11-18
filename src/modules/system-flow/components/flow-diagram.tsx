import {
  DioramaLegend,
  DioramaScene,
} from '@/modules/common/lesson/diorama/scene';
import type {
  EdgeSpec,
  SceneMove,
} from '@/modules/common/lesson/diorama/scene';
import type { StationSpec } from '@/modules/common/lesson/diorama/station';

import {
  DIAGRAM,
  edgeEnds,
  edgePairKey,
  PACKET_FILL,
  PACKET_LEGEND,
  STATION_SCREEN,
} from '../constants/diagram';
import {
  cameraView,
  GRID_LINES,
  SLAB_SHAPES,
  SLAB_TOP_POINTS,
  STATION_PING,
  STATION_SHAPES,
} from '../constants/diagram-shapes';

import type { FlowStep, NodeId } from '../types/flow';
import type React from 'react';

/** Urutan gambar stasiun: yang paling jauh (gx+gy terkecil) lebih dulu. */
const ORDERED_STATIONS = [...DIAGRAM.stations].sort(
  (a, b) => a.gx + a.gy - (b.gx + b.gy),
);

const TITLE = 'Diagram alur request: pengguna, website, server, database';
const DESC =
  'Diorama isometrik: empat stasiun berdiri di atas pelat dasar, menanjak ' +
  'dari pengguna paling dekat di kiri bawah hingga database paling jauh di ' +
  'kanan atas. Paket berwarna bergerak antar stasiun: request (kuning ' +
  'keemasan), response (hijau), dan handshake (biru).';

/** Spesifikasi stasiun scene dari konstanta modul, terurut kedalaman. */
function stationSpecs(): StationSpec[] {
  return ORDERED_STATIONS.map((node) => ({
    id: node.id,
    label: node.label,
    sub: node.sub,
    screen: STATION_SCREEN[node.id],
    ping: STATION_PING[node.id],
    shapes: STATION_SHAPES[node.id],
    labelGap: DIAGRAM.labelGap,
    pill: DIAGRAM.labelPill,
  }));
}

interface FlowDiagramProps {
  step: FlowStep;
  /** Dioper dari mesin flow; berubah saat replay agar semua packet di-remount. */
  runId: number;
  /** Stasiun yang sudah muncul (gabungan reveals langkah 0..aktif). */
  revealedNodes: ReadonlySet<NodeId>;
  reducedMotion: boolean;
}

/** Scene SVG diorama isometrik lesson alur request, dibangun dari konstanta. */
export default function FlowDiagram({
  step,
  runId,
  revealedNodes,
  reducedMotion,
}: Readonly<FlowDiagramProps>): React.JSX.Element {
  const edges: EdgeSpec[] = DIAGRAM.edges.map((edge) => {
    const { start, end } = edgeEnds(edge.from, edge.to);
    return { id: edge.id, from: edge.from, to: edge.to, start, end };
  });

  const moves: SceneMove[] = step.moves.map((move) => {
    const { start, end } = edgeEnds(move.from, move.to);
    return { ...move, start, end };
  });

  return (
    <DioramaScene
      width={DIAGRAM.width}
      height={DIAGRAM.height}
      title={TITLE}
      desc={DESC}
      slabShapes={SLAB_SHAPES}
      slabTopPoints={SLAB_TOP_POINTS}
      gridLines={GRID_LINES}
      stations={stationSpecs()}
      nodeStates={step.nodeStates}
      edges={edges}
      activeEdgeKeys={
        new Set(step.moves.map((move) => edgePairKey(move.from, move.to)))
      }
      revealedNodes={revealedNodes}
      moves={moves}
      packetFill={PACKET_FILL}
      runId={runId}
      camera={cameraView(revealedNodes)}
      reducedMotion={reducedMotion}
    />
  );
}

/** Legend packet: dot warna + label teks (informasi tidak bergantung warna saja). */
export function FlowLegend(): React.JSX.Element {
  const kinds = Object.keys(PACKET_LEGEND) as Array<keyof typeof PACKET_LEGEND>;
  return <DioramaLegend entries={kinds.map((kind) => PACKET_LEGEND[kind])} />;
}
