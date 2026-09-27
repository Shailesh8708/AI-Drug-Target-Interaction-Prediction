import { useState } from 'react'
import { AlertTriangle, ShieldCheck, Utensils, Zap, CheckCircle, RefreshCw } from 'lucide-react'
import { FLAGSHIP_DRUGS, checkDrugInteraction, getDrugProfile } from '../../services/drugIntelligenceService.js'

export default function DrugInteractionsPanel({ drug }) {
  const [partnerDrugId, setPartnerDrugId] = useState(
    FLAGSHIP_DRUGS.find((f) => f.id !== drug?.id)?.id || 'aspirin'
  )
  const [checking, setChecking] = useState(false)
  const [ddiResult, setDdiResult] = useState(null)

  const ddiWarnings = drug?.ddiWarnings || []
  const foodInteractions = drug?.foodInteractions || []

  const handleRunCheck = async () => {
    if (!drug || !partnerDrugId) return
    setChecking(true)
    const partnerDrug = await getDrugProfile(partnerDrugId)
    const res = await checkDrugInteraction(drug, partnerDrug)
    setDdiResult(res)
    setChecking(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          Drug Interactions & Safety Surveillance
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {ddiWarnings.length} Established Clinical Warnings
        </span>
      </div>

      <div className="ddi-layout-grid">
        {/* Interactive 2-Drug Checker */}
        <div className="ddi-checker-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="#38bdf8" />
              Interactive 2-Drug Interaction Checker
            </h4>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CYP Pathway Analysis</span>
          </div>

          <div className="checker-inputs-row">
            <div className="checker-select-wrap">
              <label>Drug 1 (Current)</label>
              <input
                type="text"
                value={drug?.name || ''}
                disabled
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  padding: '0.55rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div className="checker-select-wrap">
              <label>Drug 2 (Co-administered)</label>
              <select
                value={partnerDrugId}
                onChange={(e) => {
                  setPartnerDrugId(e.target.value)
                  setDdiResult(null)
                }}
              >
                {FLAGSHIP_DRUGS.filter((f) => f.id !== drug?.id).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="action-btn-pill primary"
            onClick={handleRunCheck}
            disabled={checking}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {checking ? (
              <>
                <RefreshCw size={14} className="spin" /> Evaluating CYP Overlap...
              </>
            ) : (
              <>
                <Zap size={14} /> Analyze Pairwise Interaction
              </>
            )}
          </button>

          {/* DDI Result */}
          {ddiResult && (
            <div
              className={`ddi-result-card ${
                ddiResult.severity === 'Major'
                  ? 'major'
                  : ddiResult.severity === 'Moderate'
                  ? 'moderate'
                  : ddiResult.severity === 'Minor'
                  ? 'minor'
                  : 'none'
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
                  {ddiResult.drugA} + {ddiResult.drugB}
                </strong>
                <span
                  className={`severity-pill ${
                    ddiResult.severity === 'Major'
                      ? 'major'
                      : ddiResult.severity === 'Moderate'
                      ? 'moderate'
                      : ddiResult.severity === 'Minor'
                      ? 'minor'
                      : 'none'
                  }`}
                >
                  {ddiResult.severity}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0 }}>
                {ddiResult.description}
              </p>

              {ddiResult.cypOverlap?.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                  <strong>Metabolic Isozyme Overlap:</strong> {ddiResult.cypOverlap.join(', ')}
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(51, 65, 85, 0.3)', paddingTop: '0.4rem' }}>
                <strong>Recommendation:</strong> {ddiResult.recommendation}
              </div>
            </div>
          )}
        </div>

        {/* Dietary & Food Interactions */}
        <div className="ddi-checker-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Utensils size={15} color="#10b981" />
              Dietary & Food Interactions
            </h4>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Nutrient Chelation & Metabolism</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {foodInteractions.length > 0 ? (
              foodInteractions.map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(51, 65, 85, 0.4)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                  }}
                >
                  <strong style={{ color: '#10b981', fontSize: '0.85rem', display: 'block' }}>
                    {f.food}
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                    {f.effect}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', padding: '1rem', textAlign: 'center' }}>
                No restrictive food interactions documented for this compound.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Established DDI Surveillance Table */}
      <div className="structure-panel-box">
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#f8fafc' }}>
          Documented Drug-Drug Interaction Registry
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="coverage-matrix-table">
            <thead>
              <tr>
                <th>Interacting Compound</th>
                <th>Severity</th>
                <th>Clinical Effect & Mechanism</th>
              </tr>
            </thead>
            <tbody>
              {ddiWarnings.length > 0 ? (
                ddiWarnings.map((w, i) => (
                  <tr key={i}>
                    <td>
                      <strong style={{ color: '#38bdf8' }}>{w.partner}</strong>
                    </td>
                    <td>
                      <span
                        className={`severity-pill ${
                          w.severity === 'Major'
                            ? 'major'
                            : w.severity === 'Moderate'
                            ? 'moderate'
                            : 'minor'
                        }`}
                      >
                        {w.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{w.effect}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                    No critical DDI warnings recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
