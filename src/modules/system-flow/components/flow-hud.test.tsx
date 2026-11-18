import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FlowHud from './flow-hud';

import type { HudMetric } from '../types/flow';

const METRICS: readonly HudMetric[] = [
  { id: 'dns', label: 'DNS LOOKUP', valueMs: 24 },
  { id: 'connect', label: 'CONNECT', valueMs: 38 },
];

afterEach(() => {
  vi.useRealTimers();
});

describe('FlowHud', () => {
  it('merender tile metric dengan nilai final bila animate=false', () => {
    render(
      <FlowHud
        metrics={METRICS}
        showTotal={false}
        totalMs={285}
        animate={false}
      />,
    );
    // nilai dan satuan dipisah span: cek lewat tile container, bukan getByText
    expect(screen.getByText('DNS LOOKUP').parentElement).toHaveTextContent(
      '24 ms',
    );
    expect(screen.getByText('CONNECT').parentElement).toHaveTextContent(
      '38 ms',
    );
    expect(
      screen.queryByTestId('system-flow.hud.total.text'),
    ).not.toBeInTheDocument();
  });

  it('TOTAL hanya tampil bila showTotal', () => {
    render(
      <FlowHud metrics={METRICS} showTotal totalMs={285} animate={false} />,
    );
    expect(screen.getByTestId('system-flow.hud.total.text')).toHaveTextContent(
      '285 ms',
    );
  });

  it('animate=true mencapai nilai target setelah timer berjalan', () => {
    vi.useFakeTimers();
    render(
      <FlowHud metrics={METRICS} showTotal={false} totalMs={285} animate />,
    );

    expect(screen.getByText('DNS LOOKUP').parentElement).toHaveTextContent(
      '0 ms',
    );

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText('DNS LOOKUP').parentElement).toHaveTextContent(
      '24 ms',
    );
    expect(screen.getByText('CONNECT').parentElement).toHaveTextContent(
      '38 ms',
    );
  });
});
