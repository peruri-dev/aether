import { cx } from '@/modules/common/styles/cx';

import {
  DIAGRAM,
  diagramNode,
  NODE_STYLE,
  STATION_SCREEN,
} from '../constants/diagram';
import {
  ISO_FILL,
  STATION_PING,
  STATION_SHAPES,
} from '../constants/diagram-shapes';

import type { IsoShape } from '../constants/iso';
import type { NodeId, NodeState } from '../types/flow';
import type React from 'react';

interface ShapeProps {
  shape: IsoShape;
  strokeClass: string;
}

/** Render satu bentuk isometrik precomputed dengan warna dari token. */
export function Shape({
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

  if (shape.kind === 'polygon') {
    return (
      <polygon points={shape.points} fill={ISO_FILL[shape.fill]} {...stroke} />
    );
  }
  if (shape.kind === 'path') {
    return <path d={shape.d} fill={ISO_FILL[shape.fill]} {...stroke} />;
  }
  if (shape.kind === 'ellipse') {
    return (
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={ISO_FILL[shape.fill]}
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

interface FlowStationProps {
  id: NodeId;
  state: NodeState;
  /** False selama stasiun belum di-reveal: tersembunyi dan tak terbaca screen reader. */
  visible: boolean;
  reducedMotion: boolean;
}

/**
 * Satu stasiun diorama: cincin ping (bila aktif), pedestal, objek, label,
 * dan pill keterangan — semua dari bentuk precomputed di constants.
 * Reveal progresif: fade + naik dari "tanah", terputus saat reduced motion.
 */
export default function FlowStation({
  id,
  state,
  visible,
  reducedMotion,
}: Readonly<FlowStationProps>): React.JSX.Element {
  const node = diagramNode(id);
  const station = STATION_SHAPES[id];
  const style = NODE_STYLE[state];
  const ping = STATION_PING[id];
  const center = STATION_SCREEN[id];
  const pill = DIAGRAM.labelPill;
  const pillY = center.y + DIAGRAM.labelGap + 14;

  return (
    <g
      data-node-id={id}
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: reducedMotion
          ? 'none'
          : 'opacity 450ms ease, transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {state === 'active' ? (
        <ellipse
          cx={ping.x}
          cy={ping.y}
          rx={ping.rx}
          ry={ping.ry}
          fill="none"
          strokeWidth={1.5}
          className={cx('animate-node-ping', style.stroke)}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ) : null}
      {station.platform.map((shape, index) => (
        <Shape
          key={`platform-${index}`}
          shape={shape}
          strokeClass={style.stroke}
        />
      ))}
      {station.object.map((shape, index) => (
        <Shape
          key={`object-${index}`}
          shape={shape}
          strokeClass={style.stroke}
        />
      ))}
      <text
        x={center.x}
        y={center.y + DIAGRAM.labelGap}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        className={style.label}
      >
        {node.label}
      </text>
      <rect
        x={center.x - pill.w / 2}
        y={pillY}
        width={pill.w}
        height={pill.h}
        rx={pill.h / 2}
        strokeWidth={1}
        className="fill-background-tertiary stroke-stroke-primary"
      />
      <text
        x={center.x}
        y={pillY + pill.h / 2 + 3.5}
        textAnchor="middle"
        fontSize={10}
        className={style.sub}
      >
        {node.sub}
      </text>
    </g>
  );
}
