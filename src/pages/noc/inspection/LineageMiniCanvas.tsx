import { type LineageNode, type LineageEdge } from './mockData';

interface LineageMiniCanvasProps {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

const roleStyles: Record<
  LineageNode['role'],
  { fill: string; stroke: string; label: string }
> = {
  'root-cause': { fill: '#fff7ed', stroke: '#f59e0b', label: '上游根因' },
  anomaly: { fill: '#fef2f2', stroke: '#dc2626', label: '当前异常' },
  impact: { fill: '#fefce8', stroke: '#eab308', label: '下游波及' },
  normal: { fill: '#f8f9fb', stroke: '#9ba4b3', label: '正常' },
};

const nodeWidth = 110;
const nodeHeight = 40;

function getBezierPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number
): string {
  const midX = (sx + tx) / 2;
  const curvature = Math.min(Math.abs(tx - sx) * 0.3, 50);
  return `M ${sx} ${sy} C ${midX} ${sy - curvature}, ${midX} ${ty + curvature}, ${tx} ${ty}`;
}

export default function LineageMiniCanvas({ nodes, edges }: LineageMiniCanvasProps) {
  if (!nodes.length) return null;

  // 计算 viewBox
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + nodeWidth + 20;
  const maxY = Math.max(...ys) + nodeHeight + 20;
  const width = maxX - minX;
  const height = maxY - minY;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-3">
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="w-full rounded-lg border border-dark-border bg-dark-elevated"
        style={{ height: 260 }}
      >
        <defs>
          <marker
            id="arrowhead-mini"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#c4cad4" />
          </marker>
        </defs>

        {/* 边 */}
        {edges.map((edge, i) => {
          const source = nodeMap.get(edge.sourceId);
          const target = nodeMap.get(edge.targetId);
          if (!source || !target) return null;

          const sx = source.x + nodeWidth / 2;
          const sy = source.y + nodeHeight / 2;
          const tx = target.x + nodeWidth / 2;
          const ty = target.y + nodeHeight / 2;

          return (
            <path
              key={i}
              d={getBezierPath(sx, sy, tx, ty)}
              fill="none"
              stroke="#c4cad4"
              strokeWidth={1.5}
              markerEnd="url(#arrowhead-mini)"
            />
          );
        })}

        {/* 节点 */}
        {nodes.map((node) => {
          const style = roleStyles[node.role];
          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={6}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={2}
              />
              <text
                x={nodeWidth / 2}
                y={nodeHeight / 2 - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#1a202c"
                fontSize="11"
                fontWeight="600"
              >
                {node.name.length > 6 ? node.name.slice(0, 5) + '…' : node.name}
              </text>
              <text
                x={nodeWidth / 2}
                y={nodeHeight / 2 + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#9ba4b3"
                fontSize="9"
              >
                {node.category}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 图例 */}
      <div className="flex items-center gap-4 justify-center">
        {(['root-cause', 'anomaly', 'impact', 'normal'] as const).map((role) => {
          const style = roleStyles[role];
          return (
            <div key={role} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: style.fill, border: `1.5px solid ${style.stroke}` }}
              />
              <span className="text-[11px] text-dark-text-secondary">{style.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
