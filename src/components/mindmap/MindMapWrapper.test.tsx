import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MindMapWrapper from './MindMapWrapper';
import { indicatorsToMindElixirData } from '@/utils/mindMapAdapter';
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel';
import type { Operation, NodeObj } from 'mind-elixir';

const {
  mockInit,
  mockRefresh,
  mockDestroy,
  mockToCenter,
  mockScaleFit,
  mockAddListener,
  mockRemoveListener,
  constructorCalls,
} = vi.hoisted(() => ({
  mockInit: vi.fn(),
  mockRefresh: vi.fn(),
  mockDestroy: vi.fn(),
  mockToCenter: vi.fn(),
  mockScaleFit: vi.fn(),
  mockAddListener: vi.fn(),
  mockRemoveListener: vi.fn(),
  constructorCalls: [] as unknown[],
}));

vi.mock('mind-elixir', async (importOriginal) => {
  const original = await importOriginal<typeof import('mind-elixir')>();

  class MindElixirMock {
    static LEFT = 0;
    static RIGHT = 1;
    static SIDE = 2;
    options: unknown;

    constructor(options: unknown) {
      this.options = options;
      constructorCalls.push(options);
    }

    init = mockInit;
    refresh = mockRefresh;
    destroy = mockDestroy;
    toCenter = mockToCenter;
    scaleFit = mockScaleFit;
    clearHistory = vi.fn();

    bus = {
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
      fire: vi.fn(),
    };
  }

  return {
    __esModule: true,
    default: MindElixirMock,
    LEFT: 0,
    RIGHT: 1,
    SIDE: 2,
  };
});

function makeIndicator(id: string, name: string, treeParentId?: string): IndicatorAttachment {
  return {
    id,
    name,
    treeParentId,
    tagIds: [],
    ruleIds: [],
  } as IndicatorAttachment;
}

describe('MindMapWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    constructorCalls.length = 0;
  });

  it('mounts a container and initializes Mind Elixir with converted data', () => {
    const data = [makeIndicator('ind-1', '营收同比增长率')];
    render(<MindMapWrapper data={data} defaultGroupName="默认分组" />);

    expect(screen.getByTestId('mind-map-wrapper')).toBeInTheDocument();
    expect(constructorCalls).toHaveLength(1);

    const options = constructorCalls[0] as {
      el: HTMLElement;
      direction: number;
      toolBar: boolean;
      editable: boolean;
      keypress: boolean;
    };
    expect(options.el).toBeInstanceOf(HTMLDivElement);
    expect(options.direction).toBe(2);
    expect(options.toolBar).toBe(true);
    expect(options.editable).toBe(true);
    expect(options.keypress).toBe(false);

    expect(mockInit).toHaveBeenCalledTimes(1);
    const initData = mockInit.mock.calls[0][0] as {
      nodeData: ReturnType<typeof indicatorsToMindElixirData>;
    };
    const expectedNodeData = indicatorsToMindElixirData(data, '默认分组');
    expect(initData.nodeData).toEqual(expectedNodeData);
  });

  it('injects project-dark theme with CSS variable mapping', () => {
    render(<MindMapWrapper data={[]} defaultGroupName="默认分组" />);

    const options = constructorCalls[0] as {
      theme: { name: string; cssVar: Record<string, string>; palette: string[] };
    };
    expect(options.theme.name).toBe('project-dark');
    expect(options.theme.cssVar).toMatchObject({
      '--main-color': 'var(--dark-color)',
      '--main-bgcolor': 'var(--dark-bg)',
      '--bgcolor': 'var(--dark-card-l1)',
      '--panel-color': 'var(--dark-text-secondary)',
      '--panel-bgcolor': 'var(--dark-elevated)',
      '--panel-border-color': 'var(--dark-border)',
      '--root-color': '#ffffff',
      '--root-bgcolor': '#2d3748',
      '--root-radius': '16px',
      '--selected': '#fbbf24',
    });
  });

  it('provides a palette using dark token references', () => {
    render(<MindMapWrapper data={[]} defaultGroupName="默认分组" />);

    const options = constructorCalls[0] as {
      theme: { palette: string[] };
    };
    expect(options.theme.palette).toHaveLength(8);
    expect(options.theme.palette[0]).toBe('#eab308');
    expect(options.theme.palette[1]).toBe('#8b5cf6');
  });

  it('calls onInit with the Mind Elixir instance after initialization', () => {
    const onInit = vi.fn();
    render(<MindMapWrapper data={[]} defaultGroupName="默认分组" onInit={onInit} />);

    expect(onInit).toHaveBeenCalledTimes(1);
    const instance = onInit.mock.calls[0][0] as { init: unknown; refresh: unknown };
    expect(instance.init).toBe(mockInit);
    expect(instance.refresh).toBe(mockRefresh);
  });

  it('renders the default group root when data is empty', () => {
    render(<MindMapWrapper data={[]} defaultGroupName="财务部指标树" />);

    const initData = mockInit.mock.calls[0][0] as {
      nodeData: ReturnType<typeof indicatorsToMindElixirData>;
    };
    const expectedNodeData = indicatorsToMindElixirData([], '财务部指标树');
    expect(initData.nodeData).toEqual(expectedNodeData);
    expect(initData.nodeData.children).toEqual([]);
  });

  it('disables editing when connection mode is active', () => {
    render(<MindMapWrapper data={[]} defaultGroupName="默认分组" isConnectionMode />);

    const options = constructorCalls[0] as { editable: boolean };
    expect(options.editable).toBe(false);
  });

  it('forwards operation events through onOperation callback', () => {
    const onOperation = vi.fn();
    render(<MindMapWrapper data={[]} defaultGroupName="默认分组" onOperation={onOperation} />);

    const operationCall = mockAddListener.mock.calls.find(
      (call: unknown[]) => call[0] === 'operation',
    );
    expect(operationCall).toBeDefined();
    const handler = operationCall![1] as (op: Operation) => void;

    const op = {
      name: 'finishEdit',
      obj: { id: 'ind-1', topic: 'new' },
      origin: 'old',
    } as Operation;
    handler(op);

    expect(onOperation).toHaveBeenCalledTimes(1);
    expect(onOperation).toHaveBeenCalledWith(op);
  });

  it('forwards selectNewNode events through onNodeSelect callback', () => {
    const onNodeSelect = vi.fn();
    render(<MindMapWrapper data={[]} defaultGroupName="默认分组" onNodeSelect={onNodeSelect} />);

    const selectCall = mockAddListener.mock.calls.find(
      (call: unknown[]) => call[0] === 'selectNewNode',
    );
    expect(selectCall).toBeDefined();
    const handler = selectCall![1] as (nodeObj: NodeObj) => void;

    handler({ id: 'ind-1', topic: 'node' });

    expect(onNodeSelect).toHaveBeenCalledTimes(1);
    expect(onNodeSelect).toHaveBeenCalledWith('ind-1');
  });

  it('does not destroy the Mind Elixir instance on unmount', () => {
    const { unmount } = render(<MindMapWrapper data={[]} defaultGroupName="默认分组" />);
    unmount();
    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it('refreshes the mind map when data changes', () => {
    const { rerender } = render(
      <MindMapWrapper data={[makeIndicator('ind-1', '指标 A')]} defaultGroupName="默认分组" />,
    );
    expect(mockRefresh).not.toHaveBeenCalled();

    rerender(
      <MindMapWrapper
        data={[makeIndicator('ind-1', '指标 A'), makeIndicator('ind-2', '指标 B')]}
        defaultGroupName="默认分组"
      />,
    );

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    const refreshed = mockRefresh.mock.calls[0][0] as {
      nodeData: ReturnType<typeof indicatorsToMindElixirData>;
    };
    const indicatorNodes = refreshed.nodeData.children ?? [];
    expect(indicatorNodes).toHaveLength(2);
  });
});
