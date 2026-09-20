import React, { useState } from 'react';
import { User, Building2, Calendar, Globe, BookOpen, Tag, Network, Info } from 'lucide-react';
import { GraphEdge, GraphNode } from '../api/client';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface EvidenceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ nodes, edges }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PERSON': return <User size={16} color="#0284c7" />;
      case 'ORGANIZATION': return <Building2 size={16} color="#7c3aed" />;
      case 'EVENT': return <Calendar size={16} color="#d97706" />;
      case 'PROFILE': return <Globe size={16} color="#059669" />;
      case 'PUBLICATION': return <BookOpen size={16} color="#db2777" />;
      default: return <Tag size={16} color="#64748b" />;
    }
  };

  const getNodeTheme = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PERSON':
        return { bg: '#e0f2fe', border: '#0284c7', text: '#0369a1' };
      case 'ORGANIZATION':
        return { bg: '#f3e8ff', border: '#7c3aed', text: '#6b21a8' };
      case 'EVENT':
        return { bg: '#fef3c7', border: '#d97706', text: '#b45309' };
      case 'PROFILE':
        return { bg: '#d1fae5', border: '#059669', text: '#047857' };
      case 'PUBLICATION':
        return { bg: '#fce7f3', border: '#db2777', text: '#be185d' };
      default:
        return { bg: '#f1f5f9', border: '#64748b', text: '#334155' };
    }
  };

  // Circular layout coordinates
  const nodePositions = nodes.map((node, i) => {
    const total = nodes.length;
    const radius = 175;
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const cx = 320 + radius * Math.cos(angle);
    const cy = 230 + radius * Math.sin(angle);
    return { ...node, cx, cy };
  });

  const getPosition = (id: string) => {
    const found = nodePositions.find((n) => n.id === id);
    return found ? { x: found.cx, y: found.cy } : { x: 320, y: 230 };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em', margin: 0 }}>
            Interactive Entity & Provenance Graph
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Bi-directional linkages, institutional appointments, and candidate relationships across verified evidence records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="corroborating" icon={<User size={12} />}>Person</Badge>
          <Badge variant="discriminating" icon={<Building2 size={12} />}>Organization</Badge>
          <Badge variant="status-ambiguous" icon={<Calendar size={12} />}>Event</Badge>
          <Badge variant="verified" icon={<Globe size={12} />}>Profile</Badge>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1fr) 300px',
          gap: '20px',
        }}
        className="graph-layout-grid"
      >
        {/* SVG Canvas */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            height: '480px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          }}
        >
          {nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              No graph entities discovered.
            </div>
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 640 460" style={{ cursor: 'grab' }}>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
                </marker>
                <marker
                  id="arrow-contradiction"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
                </marker>
              </defs>

              {/* Render Edges */}
              {edges.map((edge, i) => {
                const p1 = getPosition(edge.source);
                const p2 = getPosition(edge.target);
                const isConflict = edge.relationship?.toLowerCase().includes('conflict') || edge.relationship?.toLowerCase().includes('contradict');

                return (
                  <g key={i}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isConflict ? '#e11d48' : 'rgba(2, 132, 199, 0.35)'}
                      strokeWidth={isConflict ? 2.2 : 1.4}
                      strokeDasharray={isConflict ? '5,5' : undefined}
                      markerEnd={isConflict ? 'url(#arrow-contradiction)' : 'url(#arrow)'}
                    />
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 5}
                      fill={isConflict ? '#e11d48' : '#64748b'}
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {edge.relationship}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {nodePositions.map((node) => {
                const theme = getNodeTheme(node.type);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.cx}, ${node.cy})`}
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Glowing outer halo if selected */}
                    {isSelected && (
                      <circle
                        r="28"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    )}
                    <circle
                      r="20"
                      fill={theme.bg}
                      stroke={isSelected ? '#0284c7' : theme.border}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <text
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={theme.text}
                      fontFamily="var(--font-mono)"
                    >
                      {node.type.substring(0, 2)}
                    </text>
                    <text
                      y="32"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#0f172a"
                      fontFamily="var(--font-sans)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.label.length > 14 ? node.label.substring(0, 14) + '…' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Entity Inspector Panel */}
        <Card variant="standard" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Info size={16} color="#0284c7" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
              Entity Inspector
            </h4>
          </div>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Type
                </span>
                <div style={{ marginTop: '2px' }}>
                  <Badge variant="corroborating" icon={getNodeIcon(selectedNode.type)}>
                    {selectedNode.type}
                  </Badge>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Label / Name
                </span>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', margin: '2px 0 0 0' }}>
                  {selectedNode.label}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Entity ID
                </span>
                <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#0284c7', margin: '2px 0 0 0' }}>
                  {selectedNode.id}
                </p>
              </div>

              {selectedNode.attributes && Object.keys(selectedNode.attributes).length > 0 && (
                <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Attributes
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {Object.entries(selectedNode.attributes).map(([k, v]) => (
                      <div key={k} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>{k}:</span>
                        <span style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', textAlign: 'center', gap: '8px' }}>
              <Network size={28} color="#cbd5e1" />
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                Click any node in the graph to inspect entity attributes and edge linkages.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
