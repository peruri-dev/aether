// Public API modul system-flow (ADR-0008): named export saja, tanpa `export *`,
// hanya kode yang aman untuk browser.
export { default as SystemFlowView } from './components/system-flow-view';
export type {
  FlowStep,
  HudMetric,
  NodeId,
  NodeState,
  PacketKind,
  PacketMove,
} from './types/flow';
