import { useState } from 'react'
import { PieChart, Layers, Eye, Percent, Check, HelpCircle } from 'lucide-react'

export default function ElementCompositionPanel({ drug, onHighlightElement, activeHighlightedElement }) {
  if (!drug) return null

  const breakdown = drug.elementBreakdown || []
  const formula = drug.formula || 'N/A'
  const mw = drug.mw || 0

  return (
    <div
      className="element-composition-panel"
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="#10b981" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
            Elemental Stoichiometry & Mass Breakdown
          </h3>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Hill Formula: <code style={{ color: '#38bdf8', fontWeight: 700 }}>{formula}</code>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.45 }}>
        Stoichiometric quantification and mass percentage distribution across all 118 periodic elements comprising this chemical structure. Click any row to highlight its atoms in the 3D viewer.
      </p>

      {/* Breakdown Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '6px 8px' }}>Element</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Atoms</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Atomic Mass</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Mass Contrib.</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Weight %</th>
              <th style={{ padding: '6px 8px', width: '90px' }}>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.length > 0 ? (
              breakdown.map((item) => {
                const isActive = activeHighlightedElement === item.symbol
                return (
                  <tr
                    key={item.symbol}
                    onClick={() => onHighlightElement && onHighlightElement(isActive ? null : item.symbol)}
                    style={{
                      borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(51, 65, 85, 0.25)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent'
                    }}
                    title={`Click to highlight all ${item.name} (${item.symbol}) atoms in 3D`}
                  >
                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          backgroundColor: item.color || '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#0f172a',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        }}
                      >
                        {item.symbol}
                      </span>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.name}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Z={item.atomicNumber}</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#38bdf8', fontWeight: 600 }}>
                      {item.count}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#cbd5e1' }}>
                      {typeof item.atomicMass === 'number' ? item.atomicMass.toFixed(2) : item.atomicMass} u
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#cbd5e1' }}>
                      {typeof item.massContribution === 'number' ? item.massContribution.toFixed(2) : '—'} u
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {typeof item.weightPercent === 'number' ? `${item.weightPercent.toFixed(1)}%` : '100%'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(51, 65, 85, 0.5)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(2, item.weightPercent || 0))}%`,
                            height: '100%',
                            backgroundColor: item.color || '#10b981',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                  No elemental breakdown computed for this structure.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(51, 65, 85, 0.4)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          fontSize: '0.76rem',
          color: '#94a3b8',
        }}
      >
        <div>
          Total Molecular Mass: <strong style={{ color: '#f1f5f9' }}>{mw.toFixed(2)} g/mol</strong>
        </div>
        <div>
          Elements Present: <strong style={{ color: '#38bdf8' }}>{breakdown.length}</strong>
        </div>
        <div>
          Heavy Atoms: <strong style={{ color: '#10b981' }}>{drug.properties?.heavyAtomCount || drug.properties?.heavyAtoms || breakdown.filter(b => b.symbol !== 'H').reduce((sum, b) => sum + b.count, 0)}</strong>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          Calculated Property [Exact Stoichiometry]
        </div>
      </div>
    </div>
  )
}
