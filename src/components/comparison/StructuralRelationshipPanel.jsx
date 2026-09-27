import { useState } from 'react'
import {
  Share2,
  Atom,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Info,
} from 'lucide-react'

export default function StructuralRelationshipPanel({
  compoundA,
  compoundB,
  mcs,
  similarity,
  differences,
}) {
  const [showAtomMap, setShowAtomMap] = useState(false)

  // Similarity classification
  const tanimotoScore = similarity?.score ?? 0
  const tanimotoPct = similarity?.percentage ?? 0

  let similarityClass = 'Low Similarity / Divergent'
  let similarityColor = 'orange'
  if (tanimotoScore >= 0.7) {
    similarityClass = 'High Structural Homology'
    similarityColor = 'emerald'
  } else if (tanimotoScore >= 0.35) {
    similarityClass = 'Related Analog / Partial Scaffold'
    similarityColor = 'blue'
  }

  // Functional groups
  const fgA = compoundA?.topology?.functionalGroups || []
  const fgB = compoundB?.topology?.functionalGroups || []

  return (
    <div className="structural-relationship-panel">
      {/* Top Stat Metrics Grid */}
      <div className="metrics-row-grid">
        {/* MCS Overlap Card */}
        <div className="stat-card accent-emerald">
          <div className="stat-card-header">
            <span className="stat-label">Maximum Common Substructure (MCS)</span>
            <Layers size={16} className="text-emerald" />
          </div>
          <div className="stat-main-value">
            <strong>{mcs?.commonAtomsCount ?? 0}</strong>
            <small>Shared Atoms</small>
          </div>
          <div className="stat-foot-details">
            <span>{mcs?.commonBondsCount ?? 0} Shared Bonds</span>
            <span className="badge-pill emerald">
              {(mcs?.similarityScore ? (mcs.similarityScore * 100).toFixed(0) : 0)}% Core Overlap
            </span>
          </div>
        </div>

        {/* Tanimoto Similarity Card */}
        <div className={`stat-card accent-${similarityColor}`}>
          <div className="stat-card-header">
            <span className="stat-label">Topological Fingerprint Similarity</span>
            <Share2 size={16} className={`text-${similarityColor}`} />
          </div>
          <div className="stat-main-value">
            <strong>{tanimotoScore.toFixed(3)}</strong>
            <small>{tanimotoPct}% Tanimoto</small>
          </div>
          <div className="stat-foot-details">
            <span>Circular ECFP2 (Radius 2)</span>
            <span className={`badge-pill ${similarityColor}`}>{similarityClass}</span>
          </div>
        </div>

        {/* Structural Shifts Card */}
        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-label">Formula & Mass Delta (Δ B - A)</span>
            <Atom size={16} className="text-blue" />
          </div>
          <div className="stat-main-value">
            <strong>
              {differences?.propertyDeltas?.molecularWeight?.diff > 0 ? '+' : ''}
              {differences?.propertyDeltas?.molecularWeight?.diff ?? 0}
            </strong>
            <small>g/mol</small>
          </div>
          <div className="stat-foot-details">
            <span>
              {differences?.elementalDifference?.length
                ? differences.elementalDifference.map((e) => `${e.diff > 0 ? '+' : ''}${e.diff}${e.element}`).join(' ')
                : 'Identical Atoms'}
            </span>
            <span className="badge-pill blue">
              {differences?.addedToB?.length ?? 0} Added Heavy Atoms
            </span>
          </div>
        </div>
      </div>

      {/* Cheminformatics Narrative Summary */}
      <div className="glass-panel summary-narrative-card">
        <div className="narrative-heading">
          <Sparkles size={16} className="text-emerald" />
          <h4>Structural Relationship Analysis</h4>
        </div>
        <p className="narrative-text">
          {differences?.summaryText ||
            'Detailed cheminformatics analysis of topological commonalities and substituent shifts.'}
        </p>

        <div className="narrative-breakdown">
          {differences?.additionsSummary && (
            <div className="breakdown-item add">
              <PlusCircle size={15} />
              <div>
                <strong>Added to Compound B:</strong>
                <span>{differences.additionsSummary}</span>
              </div>
            </div>
          )}

          {differences?.subtractionsSummary && (
            <div className="breakdown-item sub">
              <MinusCircle size={15} />
              <div>
                <strong>Absent from Compound B:</strong>
                <span>{differences.subtractionsSummary}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Functional Groups & Elemental Shifts */}
      <div className="substructure-two-col">
        {/* Functional Groups Comparison */}
        <div className="glass-panel fg-comparison-card">
          <div className="card-mini-title">
            <span className="eyebrow">Cheminformatics</span>
            <h4>Functional Group Comparison</h4>
          </div>

          <div className="fg-two-columns">
            <div className="fg-column">
              <span className="col-mol-label a">In {compoundA.name || 'Compound A'}:</span>
              {fgA.length ? (
                <ul className="pill-list">
                  {fgA.map((g, i) => (
                    <li key={`fga-${i}`}>
                      <CheckCircle2 size={13} />
                      <span>{g.type || g.name || 'Functional group'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-sm">No special functional groups classified</p>
              )}
            </div>

            <div className="fg-column">
              <span className="col-mol-label b">In {compoundB.name || 'Compound B'}:</span>
              {fgB.length ? (
                <ul className="pill-list">
                  {fgB.map((g, i) => (
                    <li key={`fgb-${i}`}>
                      <CheckCircle2 size={13} />
                      <span>{g.type || g.name || 'Functional group'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-sm">No special functional groups classified</p>
              )}
            </div>
          </div>
        </div>

        {/* Elemental Delta Breakdown */}
        <div className="glass-panel formula-delta-card">
          <div className="card-mini-title">
            <span className="eyebrow">Composition</span>
            <h4>Elemental Atom Count Shift</h4>
          </div>

          <div className="element-chips-grid">
            {differences?.elementalDifference?.length ? (
              differences.elementalDifference.map((item) => (
                <div key={item.element} className="element-shift-chip">
                  <span className="elem-symbol">{item.element}</span>
                  <div className="elem-counts">
                    <small>A: {item.countA} → B: {item.countB}</small>
                    <strong className={item.diff > 0 ? 'pos' : item.diff < 0 ? 'neg' : ''}>
                      {item.diff > 0 ? `+${item.diff}` : item.diff}
                    </strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-sm">Identical elemental composition</p>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Atom-by-Atom MCS Mapping Table */}
      <div className="glass-panel atom-mapping-accordion">
        <button
          className="accordion-toggle"
          onClick={() => setShowAtomMap((prev) => !prev)}
          aria-expanded={showAtomMap}
        >
          <div className="accordion-label">
            <Atom size={16} />
            <strong>Atom-by-Atom Substructure Mapping ({mcs?.atomMap?.length ?? 0} mapped pairs)</strong>
          </div>
          {showAtomMap ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAtomMap && (
          <div className="accordion-body">
            <p className="accordion-help">
              Each row shows a heavy atom in Compound A and its corresponding topological match in Compound B according to the Maximum Common Substructure algorithm.
            </p>

            <div className="mapping-table-wrap">
              <table className="mapping-table">
                <thead>
                  <tr>
                    <th>Atom in Compound A</th>
                    <th>Element</th>
                    <th>Direction</th>
                    <th>Atom in Compound B</th>
                    <th>Element</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {(mcs?.atomMap || []).map(([aIdx, bIdx], index) => {
                    const elemA = compoundA.atoms?.[aIdx]?.element || 'C'
                    const elemB = compoundB.atoms?.[bIdx]?.element || 'C'
                    return (
                      <tr key={`map-${index}`}>
                        <td>
                          <strong>Atom #{aIdx}</strong>
                        </td>
                        <td>
                          <span className="element-badge">{elemA}</span>
                        </td>
                        <td className="dir-cell">↔</td>
                        <td>
                          <strong>Atom #{bIdx}</strong>
                        </td>
                        <td>
                          <span className="element-badge">{elemB}</span>
                        </td>
                        <td>
                          <span className="role-tag">Common Core</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
