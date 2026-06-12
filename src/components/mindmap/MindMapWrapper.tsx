import { useEffect, useRef } from 'react';
import MindElixir from 'mind-elixir';
import type { MindElixirInstance, NodeObj, Operation } from 'mind-elixir';
import 'mind-elixir/style.css';
import { indicatorsToMindElixirData } from '@/utils/mindMapAdapter';
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel';

const DEFAULT_PALETTE = [
  'var(--dark-accent-primary)',
  'var(--dark-accent-secondary)',
  'var(--dark-accent-gold)',
  'var(--dark-text-secondary)',
  'var(--dark-accent-primary-hover)',
  'var(--dark-text-tertiary)',
];

function mapDarkThemeToMindElixir(): Record<string, string> {
  return {
    '--main-color': 'var(--dark-color)',
    '--main-bgcolor': 'var(--dark-bg)',
    '--bgcolor': 'var(--dark-card-l1)',
  };
}

export interface MindMapWrapperProps {
  data: IndicatorAttachment[];
  defaultGroupName: string;
  direction?: 0 | 1 | 2;
  toolbar?: boolean;
  draggable?: boolean;
  keypress?: boolean;
  onOperation?: (op: Operation) => void;
  onNodeSelect?: (nodeId: string) => void;
  isConnectionMode?: boolean;
  onInit?: (instance: MindElixirInstance) => void;
}

export default function MindMapWrapper({
  data,
  defaultGroupName,
  direction = MindElixir.LEFT,
  toolbar = true,
  draggable = true,
  keypress = false,
  onOperation,
  onNodeSelect,
  isConnectionMode = false,
  onInit,
}: MindMapWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindRef = useRef<MindElixirInstance | null>(null);
  const isFirstDataEffect = useRef(true);
  const onOperationRef = useRef(onOperation);
  onOperationRef.current = onOperation;

  useEffect(() => {
    if (!containerRef.current) return;

    const mind = new MindElixir({
      el: containerRef.current,
      direction,
      editable: isConnectionMode ? false : draggable,
      toolBar: toolbar,
      keypress,
      allowUndo: false,
      theme: {
        name: 'project-dark',
        cssVar: mapDarkThemeToMindElixir(),
        palette: DEFAULT_PALETTE,
      },
    }) as MindElixirInstance;

    mindRef.current = mind;

    const nodeData = indicatorsToMindElixirData(data, defaultGroupName);
    mind.init({ nodeData });
    onInit?.(mind);

    const handleOperation = (op: Operation) => onOperationRef.current?.(op);
    const handleSelectNewNode = (nodeObj: NodeObj) => onNodeSelect?.(nodeObj.id);

    if (onOperation) mind.bus.addListener('operation', handleOperation);
    if (onNodeSelect) mind.bus.addListener('selectNewNode', handleSelectNewNode);

    return () => {
      if (onOperation) mind.bus.removeListener('operation', handleOperation);
      if (onNodeSelect) mind.bus.removeListener('selectNewNode', handleSelectNewNode);
      // Intentionally do not destroy the instance or clear the DOM.
      // Instance lifecycle is managed by the parent component.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mind = mindRef.current;
    if (!mind) return;
    if (isFirstDataEffect.current) {
      isFirstDataEffect.current = false;
      return;
    }

    const nodeData = indicatorsToMindElixirData(data, defaultGroupName);
    mind.refresh({ nodeData });
  }, [data, defaultGroupName]);

  return (
    <div
      ref={containerRef}
      data-testid="mind-map-wrapper"
      data-connection-target="mindmap-default"
      className="w-full h-full"
    />
  );
}
