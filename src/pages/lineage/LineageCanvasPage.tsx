import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import {
  ChevronLeft,
  Plus,
  Eye,
  RefreshCw,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  Maximize,
  Minus,
  PlusCircle,
  FolderTree,
  GitBranch,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import StatusBadge from '@/components/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { getNodeStyle } from './getNodeStyle';

/* ═══════════════════════════════════════════════
   类型定义
   ═══════════════════════════════════════════════ */

interface Relation {
  id: string;
  source: string;
  sourceId: string;
  sourceLevel1: string;
  target: string;
  targetId: string;
  targetLevel1: string;
  type: RelationType;
  confidence: number;
  correlation?: 'positive' | 'negative';
  description: string;
  lastModifiedBy: string;
}

type RelationType = 'DEPENDS_ON' | 'CAUSES' | 'AGGREGATES' | 'DERIVED_FROM';

interface CanvasNode {
  id: string;
  name: string;
  level1: string;
  role: 'root' | 'anomaly' | 'affected' | 'normal';
  x: number;
  y: number;
}

/* ═══════════════════════════════════════════════
   Mock 数据 - 增强版血缘图数据
   ═══════════════════════════════════════════════ */

const relationListData: Relation[] = [
  { id: 'REL-001', source: '5G用户渗透率', sourceId: 'n1', sourceLevel1: '发展',
    target: '移动业务收入', targetId: 'n2', targetLevel1: '经营',
    type: 'DEPENDS_ON', correlation: 'positive', confidence: 95, description: '5G用户增长直接带动移动业务收入提升', lastModifiedBy: '张三' },
  { id: 'REL-002', source: '移动业务收入', sourceId: 'n2', sourceLevel1: '经营',
    target: '总营收', targetId: 'n3', targetLevel1: '经营',
    type: 'AGGREGATES', correlation: 'positive', confidence: 100, description: '移动业务收入汇总至总营收', lastModifiedBy: '李四' },
  { id: 'REL-003', source: '5G用户渗透率', sourceId: 'n1', sourceLevel1: '发展',
    target: '5G流量占比', targetId: 'n4', targetLevel1: '发展',
    type: 'CAUSES', confidence: 85, description: '5G用户增长推动流量结构变化', lastModifiedBy: '王五' },
  { id: 'REL-004', source: '5G流量占比', sourceId: 'n4', sourceLevel1: '发展',
    target: '网络负荷', targetId: 'n5', targetLevel1: '交付',
    type: 'CAUSES', confidence: 80, description: '5G流量增长导致网络负荷上升', lastModifiedBy: 'AI' },
  { id: 'REL-005', source: '网络负荷', sourceId: 'n5', sourceLevel1: '交付',
    target: '扩容需求', targetId: 'n6', targetLevel1: '交付',
    type: 'DEPENDS_ON', confidence: 90, description: '网络高负荷触发扩容需求', lastModifiedBy: '张三' },
  { id: 'REL-006', source: '5G用户渗透率', sourceId: 'n1', sourceLevel1: '发展',
    target: '用户ARPU', targetId: 'n7', targetLevel1: '经营',
    type: 'DEPENDS_ON', confidence: 88, description: '5G用户渗透率提升带动ARPU增长', lastModifiedBy: '李四' },
  { id: 'REL-007', source: '用户ARPU', sourceId: 'n7', sourceLevel1: '经营',
    target: '移动业务收入', targetId: 'n2', targetLevel1: '经营',
    type: 'DEPENDS_ON', confidence: 92, description: 'ARPU提升带动移动业务收入增长', lastModifiedBy: '王五' },
  { id: 'REL-008', source: '客户满意度', sourceId: 'n8', sourceLevel1: '服务',
    target: '5G用户渗透率', targetId: 'n1', targetLevel1: '发展',
    type: 'CAUSES', confidence: 75, description: '客户满意度影响用户留存与发展', lastModifiedBy: 'AI' },
  { id: 'REL-009', source: '总营收', sourceId: 'n3', sourceLevel1: '经营',
    target: '净利润', targetId: 'n9', targetLevel1: '经营',
    type: 'DEPENDS_ON', confidence: 98, description: '总营收扣除成本后形成净利润', lastModifiedBy: '张三' },
  { id: 'REL-010', source: '宽带用户数', sourceId: 'n10', sourceLevel1: '发展',
    target: '家庭业务收入', targetId: 'n11', targetLevel1: '经营',
    type: 'DEPENDS_ON', confidence: 87, description: '宽带用户增长带动家庭业务收入', lastModifiedBy: '李四' },
];

const canvasNodesData: CanvasNode[] = [
  { id: 'n1', name: '5G用户渗透率', level1: '发展', role: 'root', x: 400, y: 180 },
  { id: 'n2', name: '移动业务收入', level1: '经营', role: 'affected', x: 600, y: 120 },
  { id: 'n3', name: '总营收', level1: '经营', role: 'affected', x: 850, y: 120 },
  { id: 'n4', name: '5G流量占比', level1: '发展', role: 'anomaly', x: 400, y: 360 },
  { id: 'n5', name: '网络负荷', level1: '交付', role: 'affected', x: 600, y: 300 },
  { id: 'n6', name: '扩容需求', level1: '交付', role: 'normal', x: 850, y: 300 },
  { id: 'n7', name: '用户ARPU', level1: '经营', role: 'affected', x: 600, y: 420 },
  { id: 'n8', name: '客户满意度', level1: '服务', role: 'root', x: 150, y: 180 },
  { id: 'n9', name: '净利润', level1: '经营', role: 'affected', x: 1100, y: 120 },
  { id: 'n10', name: '宽带用户数', level1: '发展', role: 'root', x: 150, y: 420 },
  { id: 'n11', name: '家庭业务收入', level1: '经营', role: 'affected', x: 400, y: 520 },
];

const relationTypeOptions = [
  { value: 'DEPENDS_ON' as RelationType, label: 'DEPENDS_ON', desc: '依赖：源指标依赖于目标指标', color: '#3478f6' },
  { value: 'CAUSES' as RelationType, label: 'CAUSES', desc: '因果：源指标影响目标指标', color: '#f59e0b' },
  { value: 'AGGREGATES' as RelationType, label: 'AGGREGATES', desc: '聚合：源指标由目标指标聚合而来', color: '#10b981' },
  { value: 'DERIVED_FROM' as RelationType, label: 'DERIVED_FROM', desc: '衍生：源指标由目标指标衍生计算', color: '#7c5cfc' },
];

const availableIndicators = [
  { id: 'n1', name: '5G用户渗透率', level1: '发展', role: 'root' },
  { id: 'n2', name: '移动业务收入', level1: '经营', role: 'affected' },
  { id: 'n3', name: '总营收', level1: '经营', role: 'affected' },
  { id: 'n4', name: '5G流量占比', level1: '发展', role: 'anomaly' },
  { id: 'n5', name: '网络负荷', level1: '交付', role: 'affected' },
  { id: 'n6', name: '扩容需求', level1: '交付', role: 'normal' },
  { id: 'n7', name: '用户ARPU', level1: '经营', role: 'affected' },
  { id: 'n8', name: '客户满意度', level1: '服务', role: 'root' },
  { id: 'n9', name: '净利润', level1: '经营', role: 'affected' },
  { id: 'n10', name: '宽带用户数', level1: '发展', role: 'root' },
  { id: 'n11', name: '家庭业务收入', level1: '经营', role: 'affected' },
  { id: 'n12', name: 'FTTR安装量', level1: '发展', role: 'root' },
  { id: 'n13', name: '千兆用户占比', level1: '发展', role: 'root' },
  { id: 'n14', name: 'DOU值', level1: '发展', role: 'anomaly' },
  { id: 'n15', name: '移网用户数', level1: '发展', role: 'root' },
];

/* 节点颜色按 role 映射 */
const roleLabels: Record<string, string> = {
  root: '根因',
  anomaly: '异常',
  affected: '波及',
  normal: '正常',
};

const relationTypeColors: Record<RelationType, string> = {
  'DEPENDS_ON': '#3478f6',
  'CAUSES': '#f59e0b',
  'AGGREGATES': '#10b981',
  'DERIVED_FROM': '#7c5cfc',
};

const createRelationSchema = z.object({
  sourceId: z.string().min(1, '请选择源对象'),
  targetId: z.string().min(1, '请选择目标对象'),
  relationType: z.string().min(1, '请选择关系类型'),
  correlation: z.enum(['positive', 'negative']).optional(),
  confidence: z.number().min(0).max(100).default(70),
  description: z.string().max(500).optional(),
}).refine((data) => data.sourceId !== data.targetId, {
  message: '源对象和目标对象不能相同',
  path: ['targetId'],
});

/* ═══════════════════════════════════════════════
   画布组件
   ═══════════════════════════════════════════════ */

interface LineageCanvasProps {
  nodes: CanvasNode[];
  relations: Relation[];
  selectedRelationId: string | null;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onRelationClick: (relationId: string) => void;
  zoom: number;
  pan: { x: number; y: number };
}

function LineageCanvasSVG({
  nodes,
  relations,
  selectedRelationId,
  selectedNodeId,
  onNodeClick,
  onRelationClick,
  zoom,
  pan,
}: LineageCanvasProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const nodeWidth = 150;
  const nodeHeight = 52;

  // 构建源/目标ID集合用于高亮
  const relatedNodeIds = useMemo(() => {
    if (!hoveredEdge && !selectedRelationId) return new Set<string>();
    const relId = hoveredEdge || selectedRelationId;
    const rel = relations.find((r) => r.id === relId);
    if (!rel) return new Set<string>();
    return new Set([rel.sourceId, rel.targetId]);
  }, [hoveredEdge, selectedRelationId, relations]);

  // 高亮与选中节点相连的节点和连线
  const highlightedNodeIds = useMemo(() => {
    if (!selectedNodeId && !hoveredNode) return new Set<string>();
    const nid = selectedNodeId || hoveredNode;
    const connected = new Set<string>();
    relations.forEach((r) => {
      if (r.sourceId === nid) {
        connected.add(r.targetId);
      }
      if (r.targetId === nid) {
        connected.add(r.sourceId);
      }
    });
    return connected;
  }, [selectedNodeId, hoveredNode, relations]);

  const highlightedEdgeIds = useMemo(() => {
    if (!selectedNodeId && !hoveredNode) return new Set<string>();
    const nid = selectedNodeId || hoveredNode;
    const edges = new Set<string>();
    relations.forEach((r) => {
      if (r.sourceId === nid || r.targetId === nid) {
        edges.add(r.id);
      }
    });
    return edges;
  }, [selectedNodeId, hoveredNode, relations]);

  const getNodeById = useCallback(
    (id: string) => nodes.find((n) => n.id === id),
    [nodes]
  );

  // 计算连线路径（带弧度的曲线）
  const getEdgePath = useCallback(
    (rel: Relation) => {
      const sourceNode = getNodeById(rel.sourceId);
      const targetNode = getNodeById(rel.targetId);
      if (!sourceNode || !targetNode) return '';

      const sx = sourceNode.x + nodeWidth / 2;
      const sy = sourceNode.y + nodeHeight / 2;
      const tx = targetNode.x + nodeWidth / 2;
      const ty = targetNode.y + nodeHeight / 2;

      // 使用简单的贝塞尔曲线
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(dist * 0.3, 60);
      
      // 根据方向确定控制点
      const cx1 = sx + (dx > 0 ? curvature : -curvature);
      const cy1 = sy + curvature * 0.5;
      const cx2 = tx - (dx > 0 ? curvature : -curvature);
      const cy2 = ty - curvature * 0.5;

      return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
    },
    [getNodeById]
  );

  // 中点位置（标签位置）
  const getMidpoint = useCallback(
    (rel: Relation) => {
      const sourceNode = getNodeById(rel.sourceId);
      const targetNode = getNodeById(rel.targetId);
      if (!sourceNode || !targetNode) return { x: 0, y: 0 };
      return {
        x: (sourceNode.x + targetNode.x + nodeWidth) / 2,
        y: (sourceNode.y + targetNode.y + nodeHeight) / 2,
      };
    },
    [getNodeById]
  );

  return (
    <svg
      width="100%"
      height="100%"
      className="absolute inset-0"
      style={{ cursor: 'grab' }}
    >
      <defs>
        {/* 箭头标记 */}
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#9ba4b3" />
        </marker>
        <marker
          id="arrowhead-hover"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#3478f6" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3478f6" />
        </marker>

        {/* 节点阴影滤镜 */}
        <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
        </filter>
        <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#5a96ff" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 变换组 */}
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {/* 网格背景 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="#334155" />
          </pattern>
        </defs>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

        {/* 连线 */}
        {relations.map((rel) => {
          const isHovered = hoveredEdge === rel.id;
          const isSelected = selectedRelationId === rel.id;
          const isNodeHighlighted = highlightedEdgeIds.has(rel.id);
          const isHighlighted = isHovered || isSelected || isNodeHighlighted;
          const mid = getMidpoint(rel);

          return (
            <g key={rel.id}>
              <path
                d={getEdgePath(rel)}
                fill="none"
                stroke={isSelected ? '#3478f6' : isNodeHighlighted ? '#5a96ff' : isHovered ? '#5a96ff' : '#c4cad4'}
                strokeWidth={isSelected ? 3 : isNodeHighlighted ? 2.5 : isHovered ? 2.5 : 1.5}
                strokeDasharray={isNodeHighlighted && !isSelected ? '5,3' : undefined}
                markerEnd={
                  isSelected
                    ? 'url(#arrowhead-selected)'
                    : isHighlighted
                    ? 'url(#arrowhead-hover)'
                    : 'url(#arrowhead)'
                }
                onMouseEnter={() => setHoveredEdge(rel.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => onRelationClick(rel.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              />
              {/* 关系类型标签 */}
              <g
                transform={`translate(${mid.x}, ${mid.y - 10})`}
                onMouseEnter={() => setHoveredEdge(rel.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => onRelationClick(rel.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="-32"
                  y="-9"
                  width="64"
                  height="18"
                  rx="4"
                  fill="#1e293b"
                  stroke={isHighlighted ? '#3478f6' : '#334155'}
                  strokeWidth={isHighlighted ? '1.5' : '1'}
                  style={{ transition: 'all 0.2s ease' }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHighlighted ? '#3478f6' : '#6b7789'}
                  fontSize="9"
                  fontWeight="500"
                >
                  {rel.type}
                </text>
              </g>
              {/* 置信度标签 */}
              <g
                transform={`translate(${mid.x}, ${mid.y + 8})`}
                onMouseEnter={() => setHoveredEdge(rel.id)}
                onMouseLeave={() => setHoveredEdge(null)}
              >
                <rect
                  x="-14"
                  y="-7"
                  width="28"
                  height="14"
                  rx="3"
                  fill={
                    rel.confidence >= 80
                      ? '#064e3b'
                      : rel.confidence >= 50
                      ? '#78350f'
                      : '#7f1d1d'
                  }
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={
                    rel.confidence >= 80
                      ? '#34d399'
                      : rel.confidence >= 50
                      ? '#fbbf24'
                      : '#f87171'
                  }
                  fontSize="8"
                  fontWeight="600"
                >
                  {rel.confidence}%
                </text>
              </g>
            </g>
          );
        })}

        {/* 节点 */}
        {nodes.map((node, index) => {
          const { borderColor, bgColor } = getNodeStyle(node.role);
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNodeId === node.id;
          const isRelated = relatedNodeIds.has(node.id);
          const isNeighbor = highlightedNodeIds.has(node.id);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick(node.id)}
              style={{ cursor: 'pointer' }}
              filter={isHovered || isSelected ? 'url(#nodeGlow)' : isRelated || isNeighbor ? 'url(#nodeGlow)' : 'url(#nodeShadow)'}
            >
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                width={nodeWidth}
                height={nodeHeight}
                rx="8"
                fill={isSelected ? bgColor : '#1e293b'}
                stroke={isSelected ? '#3478f6' : isHovered ? '#5a96ff' : isNeighbor ? '#5a96ff' : borderColor}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2.5 : 1.5}
                style={{ transition: 'all 0.2s ease' }}
              />
              {/* 类别色条 */}
              <rect
                x="0"
                y={nodeHeight - 4}
                width={nodeWidth}
                height="4"
                rx="0 0 8 8"
                fill={borderColor}
                opacity={0.6}
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 + 0.1 }}
                x={nodeWidth / 2}
                y={nodeHeight / 2 - 6}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e2e8f0"
                fontSize="12"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {node.name.length > 7 ? node.name.slice(0, 6) + '\u2026' : node.name}
              </motion.text>
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 + 0.15 }}
                x={nodeWidth / 2}
                y={nodeHeight / 2 + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#9ba4b3"
                fontSize="9"
                style={{ pointerEvents: 'none' }}
              >
                {node.level1}
              </motion.text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   节点详情浮窗组件
   ═══════════════════════════════════════════════ */

function NodeDetailCard({
  node,
  relations,
  onClose,
}: {
  node: CanvasNode;
  relations: Relation[];
  onClose: () => void;
}) {
  const incoming = relations.filter((r) => r.targetId === node.id);
  const outgoing = relations.filter((r) => r.sourceId === node.id);
  const { borderColor, bgColor } = getNodeStyle(node.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-16 left-4 z-20 w-72 bg-dark-elevated rounded-lg border border-dark-border shadow-lg p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: borderColor }} />
          <span className="text-[14px] font-semibold text-dark-text-primary">{node.name}</span>
        </div>
        <button onClick={onClose} className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-2 py-0.5 rounded text-[11px] font-medium"
          style={{ backgroundColor: bgColor, color: borderColor }}
        >
          {node.level1}
        </span>
        <span className="text-[11px] text-dark-text-tertiary font-mono">{node.id}</span>
      </div>

      {/* 入向关系 */}
      {incoming.length > 0 && (
        <div className="mb-3">
          <h4 className="text-[11px] font-medium text-dark-text-tertiary mb-1.5 uppercase tracking-wider">被依赖</h4>
          <div className="space-y-1">
            {incoming.map((rel) => (
              <div key={rel.id} className="flex items-center gap-1.5 text-[12px]">
                <GitBranch size={10} className="text-dark-text-tertiary" />
                <span className="text-dark-text-secondary truncate">{rel.source}</span>
                <span
                  className="shrink-0 px-1 py-0.5 rounded text-[9px] font-medium"
                  style={{
                    backgroundColor: `${relationTypeColors[rel.type]}15`,
                    color: relationTypeColors[rel.type],
                  }}
                >
                  {rel.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 出向关系 */}
      {outgoing.length > 0 && (
        <div>
          <h4 className="text-[11px] font-medium text-dark-text-tertiary mb-1.5 uppercase tracking-wider">依赖于</h4>
          <div className="space-y-1">
            {outgoing.map((rel) => (
              <div key={rel.id} className="flex items-center gap-1.5 text-[12px]">
                <ArrowRight size={10} className="text-dark-text-tertiary" />
                <span className="text-dark-text-secondary truncate">{rel.target}</span>
                <span
                  className="shrink-0 px-1 py-0.5 rounded text-[9px] font-medium"
                  style={{
                    backgroundColor: `${relationTypeColors[rel.type]}15`,
                    color: relationTypeColors[rel.type],
                  }}
                >
                  {rel.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-dark-border text-[11px] text-dark-text-tertiary">
        共 {incoming.length + outgoing.length} 条关系
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   主页面
   ═══════════════════════════════════════════════ */

export default function LineageCanvasPage() {
  const navigate = useNavigate();

  // 左侧面板状态
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState<string>('全部');
  const [modifiedByFilter, setModifiedByFilter] = useState<string>('ALL');
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);

  // 画布状态
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [relations, setRelations] = useState<Relation[]>(relationListData);
  const [nodes] = useState<CanvasNode[]>(canvasNodesData);

  // 节点详情
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // 创建关系表单 - 预填充示例数据
  const [createForm, setCreateForm] = useState({
    sourceId: '',
    targetId: '',
    relationType: '' as RelationType | '',
    correlation: '' as 'positive' | 'negative' | '',
    confidence: 70,
    description: '',
  });
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [showSourceResults, setShowSourceResults] = useState(false);
  const [showTargetResults, setShowTargetResults] = useState(false);

  // 过滤后的关系列表
  const filteredRelations = useMemo(() => {
    return relations.filter((rel) => {
      const matchType = filterType === '全部' || rel.type === filterType;
      const matchModifiedBy =
        modifiedByFilter === 'ALL' ||
        (modifiedByFilter === 'HUMAN' && rel.lastModifiedBy !== 'AI') ||
        (modifiedByFilter === 'AI' && rel.lastModifiedBy === 'AI');
      const matchSearch =
        !searchQuery ||
        rel.source.includes(searchQuery) ||
        rel.target.includes(searchQuery) ||
        rel.description.includes(searchQuery);
      return matchType && matchModifiedBy && matchSearch;
    });
  }, [relations, filterType, modifiedByFilter, searchQuery]);

  // 统计
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    relations.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [relations]);

  // 画布拖拽
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    },
    [isDragging, dragStart]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => {
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      return Math.max(0.25, Math.min(3, prev + delta));
    });
  }, []);

  // 缩放控制
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(3, z + 0.1)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.25, z - 0.1)), []);
  const handleZoomFit = useCallback(() => {
    setZoom(0.85);
    setPan({ x: 50, y: 30 });
  }, []);

  // 节点点击
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
    setSelectedRelationId(null);
  }, []);

  // 删除关系
  const handleDeleteRelation = useCallback((relationId: string) => {
    setRelations((prev) => prev.filter((r) => r.id !== relationId));
    if (selectedRelationId === relationId) setSelectedRelationId(null);
    toast.success('关系已删除');
  }, [selectedRelationId]);

  // 创建关系
  const handleCreateRelation = useCallback(() => {
    const result = createRelationSchema.safeParse({
      sourceId: createForm.sourceId,
      targetId: createForm.targetId,
      relationType: createForm.relationType,
      correlation: createForm.correlation || undefined,
      confidence: createForm.confidence,
      description: createForm.description,
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const sourceInd = availableIndicators.find((i) => i.id === createForm.sourceId);
    const targetInd = availableIndicators.find((i) => i.id === createForm.targetId);
    if (!sourceInd || !targetInd) return;

    const newRelation: Relation = {
      id: `REL-${String(relations.length + 1).padStart(3, '0')}`,
      source: sourceInd.name,
      sourceId: sourceInd.id,
      sourceLevel1: sourceInd.level1,
      target: targetInd.name,
      targetId: targetInd.id,
      targetLevel1: targetInd.level1,
      type: createForm.relationType as RelationType,
      correlation: createForm.correlation || undefined,
      confidence: createForm.confidence,
      description: createForm.description,
      lastModifiedBy: '张三',
    };

    setRelations((prev) => [...prev, newRelation]);
    setShowCreateModal(false);
    setCreateForm({ sourceId: '', targetId: '', relationType: '', correlation: '', confidence: 70, description: '' });
    setSourceSearch('');
    setTargetSearch('');
    toast.success('关系创建成功');
  }, [createForm, relations.length]);

  // 过滤候选指标
  const filteredSourceIndicators = useMemo(() => {
    if (!sourceSearch) return [];
    return availableIndicators.filter(
      (i) =>
        i.name.includes(sourceSearch) ||
        i.id.toLowerCase().includes(sourceSearch.toLowerCase())
    );
  }, [sourceSearch]);

  const filteredTargetIndicators = useMemo(() => {
    if (!targetSearch) return [];
    return availableIndicators.filter(
      (i) =>
        (i.name.includes(targetSearch) ||
          i.id.toLowerCase().includes(targetSearch.toLowerCase())) &&
        i.id !== createForm.sourceId
    );
  }, [targetSearch, createForm.sourceId]);

  const selectedSource = availableIndicators.find((i) => i.id === createForm.sourceId);
  const selectedTarget = availableIndicators.find((i) => i.id === createForm.targetId);

  // 获取选中节点的信息
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100dvh-48px-24px-24px)]"
    >
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b border-dark-border shrink-0">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-3 h-8 px-3 text-[13px] bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={14} className="mr-1" />
            返回
          </Button>
          <h1 className="text-[28px] font-semibold text-dark-text-primary leading-tight">
            配置链接关系（血缘画布）
          </h1>
          <p className="text-[13px] text-dark-text-secondary mt-1">
            维护指标间的血缘关系，支持画布可视化与影响分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="h-9 px-4 text-[14px] bg-dark-accent-primary hover:bg-dark-accent-primary-active text-white"
            onClick={() => {
              setCreateForm({ sourceId: '', targetId: '', relationType: '', correlation: '', confidence: 70, description: '' });
              setSourceSearch('');
              setTargetSearch('');
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} className="mr-1.5" />
            添加关系
          </Button>
          <Button
            variant="ghost"
            className="h-9 px-3 text-[14px]"
            onClick={() => {
              setRelations(relationListData);
              setZoom(0.85);
              setPan({ x: 50, y: 30 });
              toast.success('画布已刷新');
            }}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* ── 主内容区: 左右分栏 ── */}
      <div className="flex flex-1 overflow-hidden rounded-lg border border-dark-border">
        {/* 左侧面板 */}
        <div className="w-80 flex flex-col bg-dark-page border-r border-dark-border">
          {/* 搜索过滤区 */}
          <div className="p-4 bg-dark-elevated border-b border-dark-border shrink-0">
            <SearchInput
              placeholder="搜索关系或指标名称"
              value={searchQuery}
              onChange={setSearchQuery}
              width="w-full"
            />
            <div className="flex flex-wrap gap-1 mt-3">
              {['全部', 'DEPENDS_ON', 'CAUSES', 'AGGREGATES', 'DERIVED_FROM'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-medium transition-colors',
                    filterType === type
                      ? 'bg-dark-accent-primary text-white'
                      : 'bg-dark-page text-dark-text-secondary hover:bg-dark-tree-hover-bg'
                  )}
                >
                  {type === '全部' ? '全部' : type}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-dark-text-tertiary">BY</span>
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'HUMAN', 'AI'].map((by) => (
                <button
                  key={by}
                  onClick={() => setModifiedByFilter(by)}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-medium transition-colors',
                    modifiedByFilter === by
                      ? 'bg-dark-accent-primary text-white'
                      : 'bg-dark-page text-dark-text-secondary hover:bg-dark-tree-hover-bg'
                  )}
                >
                  {by}
                </button>
              ))}
            </div>
          </div>

          {/* 关系列表 */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredRelations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-dark-text-tertiary">
                <FolderTree size={36} className="text-dark-text-tertiary mb-2" />
                <span className="text-[14px] text-dark-text-secondary">暂无关系数据</span>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRelations.map((rel, index) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => setSelectedRelationId(rel.id === selectedRelationId ? null : rel.id)}
                    className={cn(
                      'bg-dark-elevated rounded-md p-3 cursor-pointer transition-all',
                      'border-l-[3px]',
                      selectedRelationId === rel.id
                        ? 'bg-dark-accent-primary/10 border-dark-accent-primary/30 shadow-sm'
                        : 'hover:bg-dark-page hover:shadow-sm'
                    )}
                    style={{ borderLeftColor: relationTypeColors[rel.type] }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${relationTypeColors[rel.type]}15`,
                          color: relationTypeColors[rel.type],
                        }}
                      >
                        {rel.type}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                          rel.confidence >= 80
                            ? 'bg-success-500/10 text-success-600'
                            : rel.confidence >= 50
                            ? 'bg-warning-500/10 text-warning-600'
                            : 'bg-error-500/10 text-error-600'
                        )}
                      >
                        {rel.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="font-medium text-dark-text-primary truncate">{rel.source}</span>
                      <ArrowRight size={14} className="text-dark-text-tertiary shrink-0" />
                      <span className="font-medium text-dark-text-primary truncate">{rel.target}</span>
                    </div>
                    {rel.description && (
                      <p className="text-[11px] text-dark-text-tertiary mt-1 truncate">{rel.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[11px] text-dark-text-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreateForm({
                            sourceId: rel.sourceId,
                            targetId: rel.targetId,
                            relationType: rel.type,
                            correlation: rel.correlation ?? '',
                            confidence: rel.confidence,
                            description: rel.description,
                          });
                          setSourceSearch(rel.source);
                          setTargetSearch(rel.target);
                          setShowCreateModal(true);
                        }}
                      >
                        <Pencil size={10} className="mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[11px] text-error-500 hover:text-error-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRelation(rel.id);
                        }}
                      >
                          <Trash2 size={10} className="mr-1" />
                          删除
                      </Button>
                    </div>
                    <span className="text-[10px] text-dark-text-tertiary" data-testid="last-modified-by">
                      BY {rel.lastModifiedBy}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 统计摘要 */}
          <div className="p-3 bg-dark-elevated border-t border-dark-border shrink-0">
            <div className="text-[12px] text-dark-text-secondary font-medium">
              共 {relations.length} 条关系
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              {Object.entries(stats).map(([type, count]) => (
                <span key={type} className="text-[11px] text-dark-text-tertiary">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: relationTypeColors[type as RelationType] }}
                  />
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧面板: 画布 */}
        <div className="flex-1 relative bg-dark-elevated overflow-hidden">
          {/* 画布控制栏 */}
          <div className="absolute top-0 left-0 right-0 h-11 px-4 flex items-center justify-between bg-dark-elevated/80 backdrop-blur border-b border-dark-border z-10">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleZoomOut}
              >
                <Minus size={14} />
              </Button>
              <span className="text-[12px] text-dark-text-secondary w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleZoomIn}
              >
                <PlusCircle size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 ml-1"
                onClick={handleZoomFit}
                title="适应画布"
              >
                <Maximize size={14} />
              </Button>
            </div>
            <div className="text-[12px] text-dark-text-tertiary">
              拖拽空白处平移 · 滚轮缩放 · 点击节点查看详情
            </div>
          </div>

          {/* 画布主体 */}
          <div
            className="absolute inset-0 pt-11"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleWheel}
          >
            <LineageCanvasSVG
              nodes={nodes}
              relations={relations}
              selectedRelationId={selectedRelationId}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              onRelationClick={(relId) => {
                setSelectedRelationId(relId);
                setSelectedNodeId(null);
              }}
              zoom={zoom}
              pan={pan}
            />
          </div>

          {/* 浮动快捷操作栏 */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg border border-dark-border bg-dark-elevated/95 backdrop-blur px-4 py-2 shadow-lg"
              >
                <button
                  onClick={() => {
                    setCreateForm({ sourceId: '', targetId: selectedNode.id, relationType: '', correlation: '', confidence: 70, description: '' })
                    setShowCreateModal(true)
                  }}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-dark-text-primary hover:bg-dark-accent-primary/10 transition-colors"
                >
                  <PlusCircle size={16} />
                  添加上游关系
                </button>
                <div className="w-px h-5 bg-dark-border" />
                <button
                  onClick={() => {
                    setCreateForm({ sourceId: selectedNode.id, targetId: '', relationType: '', correlation: '', confidence: 70, description: '' })
                    setShowCreateModal(true)
                  }}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-dark-text-primary hover:bg-dark-accent-primary/10 transition-colors"
                >
                  <PlusCircle size={16} />
                  添加下游关系
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 节点详情浮窗 */}
          <AnimatePresence>
            {selectedNode && (
              <NodeDetailCard
                node={selectedNode}
                relations={relations}
                onClose={() => setSelectedNodeId(null)}
              />
            )}
          </AnimatePresence>

          {/* 图例 */}
          <div className="absolute bottom-4 right-4 bg-dark-elevated/90 backdrop-blur rounded-lg p-3 shadow-sm border border-dark-border z-10">
            <div className="text-[11px] font-medium text-dark-text-secondary mb-2">图例</div>
            <div className="space-y-1.5">
              {relationTypeOptions.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: opt.color }} />
                  <span className="text-[11px] text-dark-text-secondary">{opt.label}</span>
                </div>
              ))}
              <div className="border-t border-dark-border pt-1.5 mt-1.5 space-y-1">
                {Object.entries(roleLabels).map(([role, label]) => {
                  const { borderColor: color } = getNodeStyle(role);
                  return (
                    <div key={role} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border" style={{ borderColor: color, backgroundColor: `${color}15` }} />
                      <span className="text-[11px] text-dark-text-secondary">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ 创建关系弹窗 ════════ */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[560px] bg-dark-card-l1 text-dark-text-primary border-dark-border">
          <DialogHeader>
            <DialogTitle className="text-[18px] text-dark-text-primary">创建链接关系</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {/* 源对象 */}
            <div className="relative">
              <Label className="text-[14px] font-medium text-dark-text-primary">
                源对象 <span className="text-error-500">*</span>
              </Label>
              {!selectedSource ? (
                <div className="mt-1.5">
                  <SearchInput
                    placeholder="搜索指标名称或编码"
                    value={sourceSearch}
                    onChange={(v) => {
                      setSourceSearch(v);
                      setShowSourceResults(v.length > 0);
                    }}
                    width="w-full"
                  />
                  <AnimatePresence>
                    {showSourceResults && filteredSourceIndicators.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 w-full mt-1 bg-dark-elevated border border-dark-border rounded-md shadow-lg overflow-hidden"
                      >
                        {filteredSourceIndicators.map((ind) => (
                          <button
                            key={ind.id}
                            onClick={() => {
                              setCreateForm((p) => ({ ...p, sourceId: ind.id }));
                              setShowSourceResults(false);
                              setSourceSearch(ind.name);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-page border-b border-dark-border last:border-0 text-left transition-colors"
                          >
                            <span className="text-[11px] text-dark-text-tertiary font-mono">{ind.id}</span>
                            <span className="text-[13px] text-dark-text-primary">{ind.name}</span>
                            <StatusBadge text={ind.level1} type="default" className="text-[10px]" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-1.5 p-3 border border-dark-border rounded-md flex items-center justify-between bg-dark-page">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: getNodeStyle(selectedSource.role).borderColor }}
                    />
                    <div>
                      <span className="text-[11px] text-dark-text-tertiary font-mono">{selectedSource.id}</span>
                      <div className="text-[13px] text-dark-text-primary font-medium">{selectedSource.name}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setCreateForm((p) => ({ ...p, sourceId: '' }));
                      setSourceSearch('');
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* 目标对象 */}
            <div className="relative">
              <Label className="text-[14px] font-medium text-dark-text-primary">
                目标对象 <span className="text-error-500">*</span>
              </Label>
              {!selectedTarget ? (
                <div className="mt-1.5">
                  <SearchInput
                    placeholder="搜索指标名称或编码"
                    value={targetSearch}
                    onChange={(v) => {
                      setTargetSearch(v);
                      setShowTargetResults(v.length > 0);
                    }}
                    width="w-full"
                  />
                  <AnimatePresence>
                    {showTargetResults && filteredTargetIndicators.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 w-full mt-1 bg-dark-elevated border border-dark-border rounded-md shadow-lg overflow-hidden"
                      >
                        {filteredTargetIndicators.map((ind) => (
                          <button
                            key={ind.id}
                            onClick={() => {
                              setCreateForm((p) => ({ ...p, targetId: ind.id }));
                              setShowTargetResults(false);
                              setTargetSearch(ind.name);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-page border-b border-dark-border last:border-0 text-left transition-colors"
                          >
                            <span className="text-[11px] text-dark-text-tertiary font-mono">{ind.id}</span>
                            <span className="text-[13px] text-dark-text-primary">{ind.name}</span>
                            <StatusBadge text={ind.level1} type="default" className="text-[10px]" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-1.5 p-3 border border-dark-border rounded-md flex items-center justify-between bg-dark-page">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: getNodeStyle(selectedTarget.role).borderColor }}
                    />
                    <div>
                      <span className="text-[11px] text-dark-text-tertiary font-mono">{selectedTarget.id}</span>
                      <div className="text-[13px] text-dark-text-primary font-medium">{selectedTarget.name}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setCreateForm((p) => ({ ...p, targetId: '' }));
                      setTargetSearch('');
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* 关系类型 */}
            <div>
              <Label className="text-[14px] font-medium text-dark-text-primary">
                关系类型 <span className="text-error-500">*</span>
              </Label>
              <Select
                value={createForm.relationType}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, relationType: v as RelationType }))}
              >
                <SelectTrigger className="mt-1.5 h-9">
                  <SelectValue placeholder="请选择关系类型" />
                </SelectTrigger>
                <SelectContent>
                  {relationTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                        <span>{opt.label}</span>
                        <span className="text-dark-text-tertiary">— {opt.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 正/负相关 */}
            <div>
              <Label className="text-[14px] font-medium text-dark-text-primary">
                设置正/负相关 <span className="text-dark-text-tertiary font-normal">（可选）</span>
              </Label>
              <div className="mt-1.5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreateForm((p) => ({ ...p, correlation: 'positive' }))}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-9 rounded-md border-2 text-[13px] font-medium transition-all',
                    createForm.correlation === 'positive'
                      ? 'border-success-500 bg-success-500/10 text-success-600'
                      : 'border-dark-border bg-dark-elevated text-dark-text-secondary hover:border-dark-border-hover'
                  )}
                >
                  <TrendingUp size={16} />
                  正相关
                </button>
                <button
                  type="button"
                  onClick={() => setCreateForm((p) => ({ ...p, correlation: 'negative' }))}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-9 rounded-md border-2 text-[13px] font-medium transition-all',
                    createForm.correlation === 'negative'
                      ? 'border-error-500 bg-error-500/10 text-error-600'
                      : 'border-dark-border bg-dark-elevated text-dark-text-secondary hover:border-dark-border-hover'
                  )}
                >
                  <TrendingDown size={16} />
                  负相关
                </button>
              </div>
              <p className="text-[12px] text-dark-text-tertiary mt-1">
                正相关：源对象增长带动目标对象增长；负相关：源对象增长导致目标对象下降
              </p>
            </div>

            {/* 置信度 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[14px] font-medium text-dark-text-primary">置信度</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={createForm.confidence}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        confidence: Math.max(0, Math.min(100, Number(e.target.value))),
                      }))
                    }
                    className="w-16 h-7 text-[13px] text-right"
                  />
                  <span className="text-[13px] text-dark-text-secondary">%</span>
                </div>
              </div>
              <Slider
                value={[createForm.confidence]}
                onValueChange={(vals) =>
                  setCreateForm((p) => ({ ...p, confidence: vals[0] }))
                }
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-[12px] text-dark-text-tertiary mt-1">
                表示关系成立的可信程度，用于血缘分析时排序或过滤
              </p>
            </div>

            {/* 描述 */}
            <div>
              <Label className="text-[14px] font-medium text-dark-text-primary">描述（可选）</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="补充关系来源、计算逻辑或业务背景..."
                maxLength={500}
                className="mt-1.5 min-h-[80px]"
              />
              <p className="text-[11px] text-dark-text-tertiary mt-1 text-right">
                {createForm.description.length}/500
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button
              className="bg-dark-accent-primary hover:bg-dark-accent-primary-active text-white"
              onClick={handleCreateRelation}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════ 血缘预览弹窗 ════════ */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-[900px] sm:h-[600px] flex flex-col bg-dark-card-l1 text-dark-text-primary border-dark-border">
          <DialogHeader>
            <DialogTitle className="text-[18px] flex items-center gap-2 text-dark-text-primary">
              <Eye size={18} className="text-dark-accent-primary" />
              血缘影响预览
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex overflow-hidden mt-2">
            {/* 左侧影响路径 */}
            <div className="w-[40%] border-r border-dark-border pr-4 overflow-y-auto">
              <h4 className="text-[13px] font-medium text-dark-text-secondary mb-3">影响路径</h4>
              <div className="space-y-3">
                {relations.slice(0, 6).map((rel, index) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-dark-accent-primary/10 flex items-center justify-center text-dark-accent-primary text-[10px] font-bold">
                        {index + 1}
                      </div>
                      {index < 5 && <div className="w-[1px] h-6 bg-dark-card-l3" />}
                    </div>
                    <div className="flex-1 p-2.5 bg-dark-page rounded-md">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-dark-text-primary truncate">{rel.source}</span>
                        <ArrowRight size={10} className="text-dark-text-tertiary shrink-0" />
                        <span className="font-medium text-dark-text-primary truncate">{rel.target}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium"
                          style={{
                            backgroundColor: `${relationTypeColors[rel.type]}15`,
                            color: relationTypeColors[rel.type],
                          }}
                        >
                          {rel.type}
                        </span>
                        <span className={cn(
                          'text-[10px]',
                          index < 3 ? 'text-warning-500' : 'text-success-500'
                        )}>
                          {index < 3 ? '直接影响' : '间接影响'}
                        </span>
                        <span className="text-[10px] text-dark-text-tertiary">
                          深度 {index + 1}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 影响摘要 */}
              <div className="mt-4 p-3 rounded-md bg-dark-page border border-dark-border">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-info-500 shrink-0 mt-0.5" />
                  <div className="text-[12px] text-dark-text-secondary">
                    <p>共影响 <strong className="text-dark-text-primary">{nodes.length}</strong> 个指标节点</p>
                    <p className="mt-0.5">其中直接影响 <strong className="text-warning-500">3</strong> 个，间接影响 <strong className="text-success-500">3</strong> 个</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧简化画布 */}
            <div className="flex-1 relative bg-dark-page rounded-md overflow-hidden ml-4">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="previewGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="#e8ecf1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#previewGrid)" />
                <g transform="translate(30, 20)">
                  {/* 连线 - 预览版 */}
                  {relations.slice(0, 7).map((rel) => {
                    const sNode = canvasNodesData.find((n) => n.id === rel.sourceId);
                    const tNode = canvasNodesData.find((n) => n.id === rel.targetId);
                    if (!sNode || !tNode) return null;
                    const sx = (sNode.x + 75) * 0.65;
                    const sy = (sNode.y + 26) * 0.65;
                    const tx = (tNode.x + 75) * 0.65;
                    const ty = (tNode.y + 26) * 0.65;
                    return (
                      <g key={rel.id}>
                        <line
                          x1={sx}
                          y1={sy}
                          x2={tx}
                          y2={ty}
                          stroke={relationTypeColors[rel.type]}
                          strokeWidth={1.5}
                          opacity={0.7}
                        />
                        <polygon
                          points={`0,-3 6,0 0,3`}
                          fill={relationTypeColors[rel.type]}
                          transform={`translate(${tx},${ty}) rotate(${Math.atan2(ty - sy, tx - sx) * 180 / Math.PI})`}
                          opacity={0.7}
                        />
                      </g>
                    );
                  })}
                  {/* 节点 */}
                  {canvasNodesData.slice(0, 9).map((node, idx) => {
                    const { borderColor } = getNodeStyle(node.role);
                    const x = node.x * 0.65;
                    const y = node.y * 0.65;
                    return (
                      <g key={node.id}>
                        <rect
                          x={x}
                          y={y}
                          width={98}
                          height={38}
                          rx="6"
                          fill="white"
                          stroke={borderColor}
                          strokeWidth={idx === 0 ? 2.5 : 1.5}
                          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                        />
                        <text
                          x={x + 49}
                          y={y + 16}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#2d3748"
                          fontSize="9"
                          fontWeight="500"
                        >
                          {node.name.length > 5 ? node.name.slice(0, 4) + '…' : node.name}
                        </text>
                        <text
                          x={x + 49}
                          y={y + 29}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#9ba4b3"
                          fontSize="8"
                        >
                          {node.level1}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div className="absolute bottom-2 right-2 text-[10px] text-dark-text-tertiary bg-dark-elevated/80 px-2 py-1 rounded">
                简化预览视图
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary" onClick={() => setShowPreviewModal(false)}>
              关闭
            </Button>
            <Button
              className="bg-dark-accent-primary hover:bg-dark-accent-primary-active text-white"
              onClick={() => {
                setShowPreviewModal(false);
                toast.success('已发布到图谱');
              }}
            >
              确认并发布到图谱
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
