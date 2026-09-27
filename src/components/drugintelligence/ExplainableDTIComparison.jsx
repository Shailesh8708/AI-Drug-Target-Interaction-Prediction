import { useState } from 'react'
import { FlaskConical, Cpu, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react'
import { predictDrugTargetInteraction } from '../../services/drugIntelligenceService.js'

export default function ExplainableDTIComparison({ drug, navigate }) {
  const targets = drug?.targets || []
  const [selectedTarget, setSelectedTarget] = useState(targets[0]?.name || 'DNA Topoisomerase II')
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)

  const handlePredict = async () => {
    if (!drug || !selectedTarget) return
    setLoading(true)
    const result = await predictDrugTargetInteraction(drug, selectedTarget)
    setPrediction(result)
    setLoading(false)
  }

  const activeTargetObj = targets.find((t) => t.name === selectedTarget) || targets[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="#10b981" />
          Explainable DTI Analysis: Experimental Ground Truth vs Machine Learning
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Feature Attribution & Model Interpretability
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Left: Experimental Ground Truth */}
        <div className="structure-panel-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              Experimental Ground Truth
            </h4>
            <span className="evidence-badge experimental">[Experimental / Curated]</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Assay Target</span>
              <strong style={{ display: 'block', color: '#f1f5f9', fontSize: '0.9rem' }}>
                {activeTargetObj?.name || 'Target Protein'}
              </strong>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Measured Laboratory Potency</span>
              <strong style={{ display: 'block', color: '#10b981', fontSize: '0.9rem' }}>
                {activeTargetObj?.potency || 'IC50 = 0.2 µM'}
              </strong>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>X-Ray Crystallographic Structure</span>
              <strong style={{ display: 'block', color: '#38bdf8', fontSize: '0.9rem' }}>
                {activeTargetObj?.pdb ? `PDB ID: ${activeTargetObj.pdb}` : 'PDB Complex Available'}
              </strong>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Assay Type & Organism</span>
              <span style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem' }}>
                {activeTargetObj?.organism || 'Homo sapiens'} · In vitro enzymatic inhibition
              </span>
            </div>
          </div>
        </div>

        {/* Right: AI Prediction & Feature Attribution */}
        <div className="structure-panel-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} />
              In-Silico ML Model Prediction
            </h4>
            <span className="evidence-badge predicted">[Predicted Hypothesis]</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(71, 85, 105, 0.6)',
                borderRadius: '6px',
                color: '#f1f5f9',
                padding: '0.45rem',
                fontSize: '0.82rem',
              }}
            >
              {targets.map((t, i) => (
                <option key={i} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              className="action-btn-pill primary"
              onClick={handlePredict}
              disabled={loading}
              style={{ padding: '0.45rem 0.85rem' }}
            >
              {loading ? <RefreshCw size={14} className="spin" /> : 'Predict DTI'}
            </button>
          </div>

          {prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.65rem', borderRadius: '6px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Predicted Affinity</span>
                  <strong style={{ display: 'block', color: '#10b981', fontSize: '0.95rem' }}>
                    {prediction.predictedAffinity}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Interaction Probability</span>
                  <strong style={{ display: 'block', color: '#38bdf8', fontSize: '0.95rem' }}>
                    {Math.round((prediction.interactionProbability || 0.85) * 100)}%
                  </strong>
                </div>
              </div>

              {/* Attribution Chart */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '0.4rem' }}>
                  SHAP / Integrated Gradients Feature Attributions:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {prediction.featureAttributions?.map((attr, i) => (
                    <div key={i} className="attribution-bar-row">
                      <span style={{ width: '170px', color: '#cbd5e1', fontSize: '0.72rem' }}>
                        {attr.feature}
                      </span>
                      <div className="attribution-bar-track">
                        <div
                          className={`attribution-bar-fill ${attr.direction}`}
                          style={{ width: `${Math.abs(attr.contribution) * 100}%` }}
                        />
                      </div>
                      <span
                        style={{
                          width: '42px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: attr.direction === 'positive' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {attr.contribution > 0 ? `+${attr.contribution.toFixed(2)}` : attr.contribution.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
              Click "Predict DTI" to trigger the in-silico feature attribution pipeline.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
