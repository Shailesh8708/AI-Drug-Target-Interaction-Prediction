import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  Table as TableIcon,
} from 'lucide-react'

const PROPERTY_METADATA = [
  {
    key: 'molecularWeight',
    label: 'Molecular Weight',
    unit: 'g/mol',
    description: 'Sum of atomic masses of all constituent atoms. Lipinski guideline: ≤ 500 g/mol for oral bioavailability.',
    maxNorm: 600,
  },
  {
    key: 'logP',
    label: 'Calculated LogP',
    unit: '',
    description: 'Octanol-water partition coefficient (lipophilicity). Ideal drug-like range: 0 to 5.',
    maxNorm: 6,
  },
  {
    key: 'tpsa',
    label: 'Polar Surface Area (TPSA)',
    unit: 'Å²',
    description: 'Topological surface sum over polar atoms (O, N, attached H). Guideline: < 140 Å² for cell permeability, < 90 Å² for blood-brain barrier.',
    maxNorm: 180,
  },
  {
    key: 'hbd',
    label: 'H-Bond Donors',
    unit: '',
    description: 'Number of hydrogen bond donors (OH and NH groups). Lipinski guideline: ≤ 5.',
    maxNorm: 10,
  },
  {
    key: 'hba',
    label: 'H-Bond Acceptors',
    unit: '',
    description: 'Number of hydrogen bond acceptors (O and N atoms). Lipinski guideline: ≤ 10.',
    maxNorm: 15,
  },
  {
    key: 'rotatableBonds',
    label: 'Rotatable Bonds',
    unit: '',
    description: 'Single non-ring bonds not bound to terminal heavy atoms. Measure of molecular flexibility (Veber guideline: ≤ 10).',
    maxNorm: 15,
  },
  {
    key: 'heavyAtomCount',
    label: 'Heavy Atom Count',
    unit: '',
    description: 'Number of non-hydrogen atoms in the molecular graph.',
    maxNorm: 40,
  },
  {
    key: 'ringCount',
    label: 'Ring Count',
    unit: '',
    description: 'Total number of cyclic ring systems (aliphatic + aromatic).',
    maxNorm: 6,
  },
  {
    key: 'aromaticRingCount',
    label: 'Aromatic Rings',
    unit: '',
    description: 'Number of conjugated aromatic ring systems.',
    maxNorm: 5,
  },
  {
    key: 'formalCharge',
    label: 'Formal Charge',
    unit: 'e',
    description: 'Net electrical charge of the molecule at neutral pH.',
    maxNorm: 3,
  },
]

export default function PropertyComparisonTable({
  compoundA,
  compoundB,
  differences,
}) {
  const [viewMode, setViewMode] = useState('table') // 'table' | 'visual-bars'
  const [selectedPropInfo, setSelectedPropInfo] = useState(null)

  const getPropVal = (compound, key) => {
    if (key === 'molecularWeight') {
      return compound?.molecularWeight ?? compound?.properties?.molecularWeight ?? null
    }
    return compound?.properties?.[key] ?? null
  }

  return (
    <div className="property-comparison-panel glass-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Physicochemical profiling</p>
          <h3>Molecular Property Comparison & Differences</h3>
        </div>

        <div className="mode-toggle-row">
          <button
            className={`toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={14} /> Side-by-Side Table
          </button>
          <button
            className={`toggle ${viewMode === 'visual-bars' ? 'active' : ''}`}
            onClick={() => setViewMode('visual-bars')}
          >
            <BarChart2 size={14} /> Comparative Visual Bars
          </button>
        </div>
      </div>

      {selectedPropInfo && (
        <div className="property-explainer-banner">
          <div className="explainer-content">
            <strong>{selectedPropInfo.label}:</strong>
            <span>{selectedPropInfo.description}</span>
          </div>
          <button className="quiet-button small" onClick={() => setSelectedPropInfo(null)}>
            Dismiss
          </button>
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>
                  <div className="header-mol-chip a">
                    <span>A</span> {compoundA.name || 'Compound A'}
                  </div>
                </th>
                <th>
                  <div className="header-mol-chip b">
                    <span>B</span> {compoundB.name || 'Compound B'}
                  </div>
                </th>
                <th>Difference (Δ = B - A)</th>
                <th>Guideline Compliance</th>
              </tr>
            </thead>
            <tbody>
              {/* Formula row */}
              <tr className="table-row">
                <td className="prop-name">
                  <span>Molecular Formula</span>
                </td>
                <td className="prop-val-a"><code>{compoundA.formula || '—'}</code></td>
                <td className="prop-val-b"><code>{compoundB.formula || '—'}</code></td>
                <td className="prop-diff">
                  {differences?.elementalDifference?.length ? (
                    <span className="element-diff-badge">
                      {differences.elementalDifference
                        .map((e) => `${e.diff > 0 ? `+` : ''}${e.diff}${e.element}`)
                        .join(' ')}
                    </span>
                  ) : (
                    <span className="diff-zero">Identical formula</span>
                  )}
                </td>
                <td><span className="tag-neutral">Formula Shift</span></td>
              </tr>

              {/* Numerical Properties */}
              {PROPERTY_METADATA.map((prop) => {
                const valA = getPropVal(compoundA, prop.key)
                const valB = getPropVal(compoundB, prop.key)

                let diff = null
                let diffStr = '—'
                let diffClass = 'zero'

                if (valA !== null && valB !== null) {
                  diff = Number((valB - valA).toFixed(2))
                  if (diff > 0) {
                    diffStr = `+${diff}`
                    diffClass = 'positive'
                  } else if (diff < 0) {
                    diffStr = `${diff}`
                    diffClass = 'negative'
                  } else {
                    diffStr = '0.00'
                    diffClass = 'zero'
                  }
                }

                // Lipinski or guideline note
                let compliance = <span className="tag-neutral">—</span>
                if (prop.key === 'molecularWeight') {
                  const passA = valA <= 500
                  const passB = valB <= 500
                  compliance = passA && passB ? (
                    <span className="compliance-tag pass"><CheckCircle2 size={12} /> Both ≤ 500 Da</span>
                  ) : (
                    <span className="compliance-tag warn"><AlertTriangle size={12} /> Exceeds 500 Da</span>
                  )
                } else if (prop.key === 'logP') {
                  const pass = valB <= 5 && valB >= 0
                  compliance = pass ? (
                    <span className="compliance-tag pass"><CheckCircle2 size={12} /> Optimal Lipophilicity</span>
                  ) : (
                    <span className="compliance-tag warn"><AlertTriangle size={12} /> High Lipophilicity</span>
                  )
                }

                return (
                  <tr key={prop.key} className="table-row">
                    <td className="prop-name">
                      <div className="prop-label-flex">
                        <span>{prop.label}</span>
                        <button
                          className="info-icon-btn"
                          onClick={() => setSelectedPropInfo(prop)}
                          title="Show property meaning"
                        >
                          <HelpCircle size={12} />
                        </button>
                      </div>
                      {prop.unit && <small className="unit-label">{prop.unit}</small>}
                    </td>
                    <td className="prop-val-a">
                      <strong>{valA !== null ? `${valA}${prop.unit ? ` ${prop.unit}` : ''}` : '—'}</strong>
                    </td>
                    <td className="prop-val-b">
                      <strong>{valB !== null ? `${valB}${prop.unit ? ` ${prop.unit}` : ''}` : '—'}</strong>
                    </td>
                    <td className="prop-diff">
                      <span className={`diff-badge ${diffClass}`}>
                        {diffClass === 'positive' && <TrendingUp size={12} />}
                        {diffClass === 'negative' && <TrendingDown size={12} />}
                        {diffClass === 'zero' && <Minus size={12} />}
                        {diffStr} {prop.unit}
                      </span>
                    </td>
                    <td>{compliance}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Comparative Bar Charts */
        <div className="visual-bars-grid">
          {PROPERTY_METADATA.map((prop) => {
            const valA = Number(getPropVal(compoundA, prop.key)) || 0
            const valB = Number(getPropVal(compoundB, prop.key)) || 0
            const max = Math.max(valA, valB, prop.maxNorm) || 1

            const pctA = Math.min(100, Math.max(4, (valA / max) * 100))
            const pctB = Math.min(100, Math.max(4, (valB / max) * 100))
            const diff = Number((valB - valA).toFixed(2))

            return (
              <div key={prop.key} className="bar-card">
                <div className="bar-card-header">
                  <strong>{prop.label}</strong>
                  <span className={`diff-pill ${diff > 0 ? 'pos' : diff < 0 ? 'neg' : 'neu'}`}>
                    Δ {diff > 0 ? `+${diff}` : diff} {prop.unit}
                  </span>
                </div>

                <div className="bars-stack">
                  {/* Molecule A Bar */}
                  <div className="bar-row">
                    <span className="mol-tag a">A</span>
                    <div className="track">
                      <div className="fill a" style={{ width: `${pctA}%` }} />
                    </div>
                    <span className="bar-val">{valA} {prop.unit}</span>
                  </div>

                  {/* Molecule B Bar */}
                  <div className="bar-row">
                    <span className="mol-tag b">B</span>
                    <div className="track">
                      <div className="fill b" style={{ width: `${pctB}%` }} />
                    </div>
                    <span className="bar-val">{valB} {prop.unit}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
