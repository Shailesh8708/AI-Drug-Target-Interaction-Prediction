import { GitCompare, Sparkles, Layers, ArrowUpRight } from 'lucide-react'

export default function SimilarDrugsSARPanel({ drug, onSelectDrug, navigate }) {
  if (!drug) return null

  const similarDrugs = drug.similarDrugs || [
    { name: 'Levofloxacin', tanimoto: 0.84, diff: 'N-methylpiperazine vs piperazine, chiral oxazine ring' },
    { name: 'Ofloxacin', tanimoto: 0.81, diff: 'Racemic oxazine ring, higher water solubility' },
    { name: 'Norfloxacin', tanimoto: 0.78, diff: 'Ethyl group at N1 instead of cyclopropyl' },
    { name: 'Moxifloxacin', tanimoto: 0.72, diff: 'Diazabicyclononyl moiety at C7, C8-methoxy substituent' },
  ]

  const sarInsights = drug.sarInsights || [
    {
      modification: 'C-7 Basic Ring Modification',
      impact: 'Alters antibacterial spectrum against Gram-positive bacteria and modulates CNS GABA-A receptor affinity.',
    },
    {
      modification: 'C-6 Fluorine Atom',
      impact: 'Increases cell membrane permeability and enhances DNA gyrase binding affinity by over 10-fold.',
    },
    {
      modification: 'N-1 Cyclopropyl Substitution',
      impact: 'Significantly improves antibacterial potency and expands Gram-negative coverage.',
    },
  ]

  // Mock scatter points for chemical series landscape
  const scatterPoints = [
    { label: drug.name.split(' ')[0], logP: drug.logP ?? 1.5, mw: drug.mw ?? 330, isCurrent: true },
    { label: 'Analogue A', logP: (drug.logP ?? 1.5) + 0.8, mw: (drug.mw ?? 330) + 42, isCurrent: false },
    { label: 'Analogue B', logP: (drug.logP ?? 1.5) - 0.6, mw: (drug.mw ?? 330) - 28, isCurrent: false },
    { label: 'Analogue C', logP: (drug.logP ?? 1.5) + 1.2, mw: (drug.mw ?? 330) + 70, isCurrent: false },
    { label: 'Analogue D', logP: (drug.logP ?? 1.5) - 1.1, mw: (drug.mw ?? 330) - 55, isCurrent: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare size={18} color="#38bdf8" />
          Structural Congeners, SAR Intelligence & Bioactivity Landscape
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Morgan Fingerprint Tanimoto Metrics
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem' }}>
        {/* Left: Similar Drugs Cards */}
        <div className="structure-panel-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>
              High-Similarity Congeners (Tanimoto &ge; 0.70)
            </h4>
            {navigate && (
              <button
                className="action-btn-pill"
                onClick={() => navigate('compare')}
                title="Open 2-Molecule Structure Comparison"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                <GitCompare size={12} /> Launch Comparison Lab
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {similarDrugs.map((sim, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{sim.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    {sim.diff}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Tanimoto: {sim.tanimoto.toFixed(2)}
                  </span>
                  <button
                    className="action-btn-pill"
                    style={{ padding: '3px 7px' }}
                    onClick={() => onSelectDrug && onSelectDrug(sim.name)}
                    title={`Analyze ${sim.name}`}
                  >
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SAR Rules */}
          <div style={{ marginTop: '0.75rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
              Structure-Activity Relationship (SAR) Rules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sarInsights.map((sar, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    borderLeft: '3px solid #38bdf8',
                  }}
                >
                  <strong style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>{sar.modification}:</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '6px' }}>
                    {sar.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chemical Landscape Scatter Plot */}
        <div className="structure-panel-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>
              Chemical Series Bioactivity Landscape
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>MW vs LogP Distribution</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '320px',
              background: 'radial-gradient(circle at center, #0f172a 0%, #030712 100%)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '8px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '0.5rem',
            }}
          >
            <svg viewBox="0 0 360 280" style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1="40" y1="240" x2="330" y2="240" stroke="#334155" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="240" stroke="#334155" strokeWidth="1" />

              <text x="180" y="265" textAnchor="middle" fontSize="10" fill="#94a3b8">
                Calculated LogP (Lipophilicity)
              </text>
              <text
                x="15"
                y="130"
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                transform="rotate(-90, 15, 130)"
              >
                Molecular Weight (Da)
              </text>

              {/* Data Points */}
              {scatterPoints.map((pt, i) => {
                const cx = 50 + (i * 55)
                const cy = 210 - (i % 3) * 60 - (pt.isCurrent ? 20 : 0)
                return (
                  <g key={i}>
                    {pt.isCurrent && (
                      <circle cx={cx} cy={cy} r="18" fill="rgba(16, 185, 129, 0.2)" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={pt.isCurrent ? 8 : 6}
                      fill={pt.isCurrent ? '#10b981' : '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill={pt.isCurrent ? '#34d399' : '#cbd5e1'}
                      fontWeight={pt.isCurrent ? 'bold' : 'normal'}
                    >
                      {pt.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Green Node: Current Compound</span>
            <span>Blue Nodes: Congeners & Structural Analogues</span>
          </div>
        </div>
      </div>
    </div>
  )
}
