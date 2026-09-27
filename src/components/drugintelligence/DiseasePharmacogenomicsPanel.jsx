import { Stethoscope, Dna, Activity, BookmarkCheck } from 'lucide-react'

export default function DiseasePharmacogenomicsPanel({ drug }) {
  if (!drug) return null

  const indications = drug.indications || ['Primary Care Medicine']
  const pharmacogenomics = drug.pharmacogenomics || [
    {
      gene: 'CYP2D6',
      allele: '*4, *5 (Loss of function)',
      phenotype: 'Poor Metabolizer',
      clinicalEffect: 'Reduced hepatic clearance, elevated plasma AUC and prolonged elimination half-life.',
      recommendation: 'Consider 25-50% dose reduction or monitor drug plasma concentrations closely.',
    },
    {
      gene: 'SLCO1B1',
      allele: '521T>C (rs4149056)',
      phenotype: 'Decreased OATP1B1 Transporter Activity',
      clinicalEffect: 'Increased systemic exposure with elevated risk of statin-associated myopathy or toxicity.',
      recommendation: 'Choose alternative agent or restrict to lowest effective clinical dose.',
    },
  ]

  const trials = drug.clinicalTrials || {
    total: 24,
    completed: 18,
    active: 4,
    phaseBreakdown: 'Phase I (3), Phase II (7), Phase III (11), Phase IV (3)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stethoscope size={18} color="#38bdf8" />
          Clinical Indications & Pharmacogenomics (PGx)
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Precision Medicine & Biomarker Stratification
        </span>
      </div>

      {/* Approved Indications */}
      <div className="structure-panel-box">
        <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.95rem', color: '#f8fafc' }}>
          Approved Therapeutic Indications & Clinical Uses
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {indications.map((ind, i) => (
            <span
              key={i}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              <BookmarkCheck size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* Pharmacogenomics Table */}
      <div className="structure-panel-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Dna size={16} color="#a855f7" />
            Pharmacogenomic Biomarkers & Allelic Stratification
          </h4>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CPIC / PharmGKB Guidelines</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="coverage-matrix-table">
            <thead>
              <tr>
                <th>Biomarker Gene</th>
                <th>Target Allele / Variant</th>
                <th>Metabolic Phenotype</th>
                <th>Clinical Consequence</th>
                <th>CPIC Actionable Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {pharmacogenomics.map((pg, i) => (
                <tr key={i}>
                  <td>
                    <strong style={{ color: '#a855f7' }}>{pg.gene}</strong>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{pg.allele}</td>
                  <td>
                    <span
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {pg.phenotype}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{pg.clinicalEffect}</td>
                  <td style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 500 }}>
                    {pg.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Trials Overview */}
      <div className="structure-panel-box">
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} color="#f59e0b" />
          Clinical Trial Landscape (ClinicalTrials.gov Data)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Studies Registered</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', color: '#f1f5f9', marginTop: '2px' }}>
              {trials.total}
            </strong>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Completed Trials</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', color: '#10b981', marginTop: '2px' }}>
              {trials.completed}
            </strong>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Active / Recruiting</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', color: '#38bdf8', marginTop: '2px' }}>
              {trials.active}
            </strong>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Phase Distribution</span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
              {trials.phaseBreakdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
