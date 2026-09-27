import { useState, useMemo } from 'react'
import { Network, Info, Zap } from 'lucide-react'

export default function DrugTargetNetworkGraph({ drug }) {
  const [selectedNode, setSelectedNode] = useState(null)

  // Construct Network Nodes & Edges
  const { nodes, edges } = useMemo(() => {
    if (!drug) return { nodes: [], edges: [] }

    const drugNode = {
      id: 'drug',
      label: drug.name.split(' ')[0],
      type: 'drug',
      color: '#10b981',
      r: 24,
      x: 300,
      y: 200,
      details: `${drug.class || 'Therapeutic Agent'} · MW ${drug.mw?.toFixed(0)}`,
    }

    const nList = [drugNode]
    const eList = []

    // Targets (Cyan)
    const targets = (drug.targets || []).slice(0, 4)
    targets.forEach((t, i) => {
      const angle = (i / Math.max(1, targets.length)) * Math.PI - Math.PI / 2
      const x = 300 + Math.cos(angle) * 140
      const y = 200 + Math.sin(angle) * 120
      const tNode = {
        id: `target_${i}`,
        label: t.symbol || t.name.split(' ')[0],
        type: 'target',
        color: '#38bdf8',
        r: 18,
        x,
        y,
        details: `Target: ${t.name} · Role: ${t.role || 'Primary Target'}`,
      }
      nList.push(tNode)
      eList.push({ from: drugNode, to: tNode, label: 'Binds / Inhibits' })
    })

    // Pathways (Purple)
    const pathways = (drug.pathways || ['Signal Transduction', 'Cellular Homeostasis']).slice(0, 3)
    pathways.forEach((p, i) => {
      const x = 120 + i * 80
      const y = 330
      const pNode = {
        id: `pathway_${i}`,
        label: p.split(' ')[0],
        type: 'pathway',
        color: '#a855f7',
        r: 15,
        x,
        y,
        details: `Biological Pathway: ${p}`,
      }
      nList.push(pNode)
      if (targets[i % targets.length]) {
        eList.push({
          from: nList.find((n) => n.id === `target_${i % targets.length}`),
          to: pNode,
          label: 'Regulates',
        })
      }
    })

    // Indications / Diseases (Amber)
    const indications = (drug.indications || ['Pain', 'Inflammation']).slice(0, 3)
    indications.forEach((ind, i) => {
      const x = 480 + (i % 2) * 50
      const y = 100 + i * 90
      const indNode = {
        id: `ind_${i}`,
        label: ind.split(' ')[0],
        type: 'disease',
        color: '#f59e0b',
        r: 16,
        x,
        y,
        details: `Therapeutic Indication: ${ind}`,
      }
      nList.push(indNode)
      eList.push({ from: drugNode, to: indNode, label: 'Treats' })
    })

    return { nodes: nList, edges: eList }
  }, [drug])

  return (
    <div className="network-graph-shell">
      <div className="panel-subheading">
        <h3>
          <Network size={18} color="#10b981" />
          AI Drug Intelligence Graph (Drug–Target–Pathway–Disease)
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Interactive Multidimensional Topology
        </span>
      </div>

      <div className="network-legend-bar">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#10b981' }} />
          <span>Drug Core</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#38bdf8' }} />
          <span>Biological Target</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#a855f7' }} />
          <span>Metabolic Pathway</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#f59e0b' }} />
          <span>Clinical Indication</span>
        </div>
      </div>

      <div className="network-svg-container">
        <svg viewBox="0 0 600 420" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            if (!e.from || !e.to) return null
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke="rgba(71, 85, 105, 0.5)"
                  strokeWidth={1.5}
                  strokeDasharray={e.from.type === 'drug' && e.to.type === 'disease' ? '4,4' : 'none'}
                />
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 6}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="3,3"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={node.color}
                  fillOpacity={0.85}
                  stroke="#0f172a"
                  strokeWidth={2}
                  filter="url(#glow)"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={node.type === 'drug' ? '11' : '9'}
                  fontWeight="bold"
                  fontFamily="-apple-system, sans-serif"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Selected Node Status Card */}
        {selectedNode && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${selectedNode.color}`,
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: selectedNode.color,
                }}
              />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>
                  {selectedNode.label} ({selectedNode.type.toUpperCase()})
                </strong>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  {selectedNode.details}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
