import { Activity, CheckCircle, AlertTriangle, HelpCircle, ShieldAlert } from 'lucide-react'

export default function ChemicalPropertiesPanel({ drug }) {
  if (!drug) return null

  const lip = drug.lipinski || { violations: 0, details: [] }
  const dl = drug.drugLikeness || {
    lipinskiPass: true,
    veber: true,
    ghose: true,
    bioavailabilityScore: 0.55,
  }

  const expProps = drug.experimentalProperties || {}

  return (
    <div className="structure-panel-box">
      <div className="panel-subheading">
        <h3>
          <Activity size={17} color="#38bdf8" />
          Physicochemical & Drug-Likeness Profile
        </h3>
        <span
          className={lip.violations === 0 ? 'status-tag-pass' : 'status-tag-fail'}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {lip.violations === 0 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
          {lip.violations === 0 ? 'Lipinski Compliant' : `${lip.violations} Violations`}
        </span>
      </div>

      {/* 8-Card Metric Grid */}
      <div className="properties-quad-grid">
        <div className="property-metric-card">
          <span className="metric-title">Molecular Weight</span>
          <span className="metric-number">{drug.mw ? drug.mw.toFixed(1) : 'N/A'}</span>
          <span className="metric-sub">g/mol (Rule: ≤ 500)</span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">LogP (Lipophilicity)</span>
          <span className="metric-number">
            {drug.logP !== undefined ? drug.logP.toFixed(2) : 'N/A'}
          </span>
          <span className="metric-sub">
            {expProps.logP ? `Exp: ${expProps.logP}` : 'Calc (Rule: ≤ 5.0)'}
          </span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">Polar Surface Area (TPSA)</span>
          <span className="metric-number">{drug.tpsa ?? 'N/A'}</span>
          <span className="metric-sub">Å² (Veber: ≤ 140)</span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">H-Bond Donors (HBD)</span>
          <span className="metric-number">{drug.hbd ?? 0}</span>
          <span className="metric-sub">Count (Rule: ≤ 5)</span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">H-Bond Acceptors (HBA)</span>
          <span className="metric-number">{drug.hba ?? 0}</span>
          <span className="metric-sub">Count (Rule: ≤ 10)</span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">Rotatable Bonds</span>
          <span className="metric-number">{drug.rotatableBonds ?? 0}</span>
          <span className="metric-sub">Flexibility (Veber: ≤ 10)</span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">Aromatic Rings</span>
          <span className="metric-number">{drug.aromaticRings ?? 0}</span>
          <span className="metric-sub">Aromatic Scaffolds</span>
        </div>

        <div className="property-metric-card">
          <span className="metric-title">Solubility (LogS)</span>
          <span className="metric-number" style={{ fontSize: '1rem' }}>
            {drug.solubility || '-3.2 LogS'}
          </span>
          <span className="metric-sub">Aqueous Solubility</span>
        </div>
      </div>

      {/* Drug Likeness Rule Audits */}
      <div style={{ marginTop: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>
          Medicinal Chemistry Filters
        </h4>
        <div className="drug-likeness-list">
          {/* Lipinski */}
          <div className="rule-check-item">
            <div className="rule-name-desc">
              <span className="rule-name">Lipinski's Rule of Five (Pfizer)</span>
              <span className="rule-desc">
                Evaluates oral drug bioavailability (MW ≤ 500, LogP ≤ 5, HBD ≤ 5, HBA ≤ 10)
              </span>
            </div>
            <span className={lip.violations === 0 ? 'status-tag-pass' : 'status-tag-fail'}>
              {lip.violations === 0 ? 'PASSED (0 Violations)' : `VIOLATION (${lip.violations})`}
            </span>
          </div>

          {/* Veber */}
          <div className="rule-check-item">
            <div className="rule-name-desc">
              <span className="rule-name">Veber Filter (GSK)</span>
              <span className="rule-desc">
                Permeability & oral bioavailability: Rotatable Bonds ≤ 10 and TPSA ≤ 140 Å²
              </span>
            </div>
            <span className={dl.veber ? 'status-tag-pass' : 'status-tag-fail'}>
              {dl.veber ? 'PASSED' : 'VIOLATION'}
            </span>
          </div>

          {/* Ghose */}
          <div className="rule-check-item">
            <div className="rule-name-desc">
              <span className="rule-name">Ghose Comprehensive Filter</span>
              <span className="rule-desc">
                Evaluates compound drug-likeness across size, lipophilicity, atom counts & refractivity
              </span>
            </div>
            <span className={dl.ghose ? 'status-tag-pass' : 'status-tag-fail'}>
              {dl.ghose ? 'PASSED' : 'VIOLATION'}
            </span>
          </div>

          {/* Bioavailability Score */}
          <div className="rule-check-item">
            <div className="rule-name-desc">
              <span className="rule-name">Abbott Bioavailability Score</span>
              <span className="rule-desc">
                Probability of having &gt;10% oral bioavailability in rodents or human Caco-2
              </span>
            </div>
            <span className="status-tag-pass" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
              {Math.round((dl.bioavailabilityScore || 0.55) * 100)}% Estimated
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
