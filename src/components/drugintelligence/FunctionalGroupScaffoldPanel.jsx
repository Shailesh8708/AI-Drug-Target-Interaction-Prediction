import { useState } from 'react'
import { Cpu, Boxes, Fingerprint, Info, Sparkles } from 'lucide-react'

export default function FunctionalGroupScaffoldPanel({ drug, onHighlightIndices, activeIndices = [] }) {
  if (!drug) return null

  const functionalGroups = drug.functionalGroups || []
  const scaffold = drug.murckoScaffold || 'N/A'

  return (
    <div className="scaffold-box">
      <div className="panel-subheading">
        <h3>
          <Boxes size={17} color="#38bdf8" />
          Scaffold & Functional Group Intelligence
        </h3>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          {functionalGroups.length} Groups Identified
        </span>
      </div>

      {/* Bemis-Murcko Framework */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
          <Fingerprint size={14} color="#10b981" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0' }}>
            Bemis–Murcko Core Scaffold
          </span>
        </div>
        <div className="scaffold-code">{scaffold}</div>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.4rem 0 0' }}>
          The Murcko scaffold isolates the core ring systems and connecting linkers, discarding peripheral side-chains to analyze structural chemotype clustering.
        </p>
      </div>

      {/* Identified Functional Groups */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0' }}>
            Recognized Pharmacophore Substructures:
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Click to highlight in 3D</span>
        </div>

        <div className="functional-groups-flex">
          {functionalGroups.length > 0 ? (
            functionalGroups.map((fg, i) => {
              const name = typeof fg === 'string' ? fg : fg.name
              const formula = typeof fg === 'object' && fg.formula ? ` (${fg.formula})` : ''
              const indices = typeof fg === 'object' && fg.atomIndices ? fg.atomIndices : []
              const isSelected = indices.length > 0 && activeIndices.length > 0 && indices.every(idx => activeIndices.includes(idx))

              return (
                <button
                  key={i}
                  className={`fg-chip ${isSelected ? 'active-fg' : ''}`}
                  onClick={() => {
                    if (!onHighlightIndices) return
                    if (isSelected) {
                      onHighlightIndices([])
                    } else {
                      onHighlightIndices(indices)
                    }
                  }}
                  style={{
                    cursor: indices.length > 0 ? 'pointer' : 'default',
                    border: isSelected ? '1px solid #10b981' : '1px solid rgba(51, 65, 85, 0.5)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    color: isSelected ? '#34d399' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title={indices.length > 0 ? `Click to highlight ${name} atoms in 3D` : name}
                >
                  {name}{formula}
                </button>
              )
            })
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              Standard aliphatic / aromatic hydrocarbon backbone.
            </span>
          )}
        </div>
      </div>

      {/* Structural Architecture Insights */}
      <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.4)', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
          <Info size={13} />
          <span>Medicinal Chemistry Rationale</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
          Specific functional motifs (such as fluorine substituents or basic amine rings) frequently serve to optimize target-binding affinity, block oxidative metabolic soft-spots, and fine-tune physiological ionization.
        </p>
      </div>
    </div>
  )
}
