import { Target, Dna, FlaskConical, ExternalLink, ArrowRight } from 'lucide-react'

export default function TargetIntelligencePanel({ drug, navigate }) {
  if (!drug) return null

  const targets = drug.targets || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="#38bdf8" />
          Biological Target Intelligence & Macromolecular Bridges
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {targets.length} Documented Molecular Targets
        </span>
      </div>

      <div className="targets-panel-grid">
        {targets.map((t, idx) => (
          <div key={idx} className="target-intel-card">
            <div>
              <div className="target-card-header">
                <div>
                  <h4>{t.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                    {t.symbol || t.name.split(' ')[0]}
                  </div>
                </div>
                <span className="target-role-badge">{t.role || 'Primary Target'}</span>
              </div>

              <div className="target-details-list" style={{ marginTop: '0.85rem' }}>
                <div className="target-detail-row">
                  <span className="td-label">Organism:</span>
                  <span className="td-val">{t.organism || 'Homo sapiens'}</span>
                </div>

                <div className="target-detail-row">
                  <span className="td-label">UniProt ID:</span>
                  <span className="td-val">
                    {t.uniprot ? (
                      <a
                        href={`https://www.uniprot.org/uniprotkb/${t.uniprot}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'none' }}
                      >
                        {t.uniprot} <ExternalLink size={10} style={{ verticalAlign: 'middle' }} />
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>

                <div className="target-detail-row">
                  <span className="td-label">PDB Complex:</span>
                  <span className="td-val" style={{ color: '#10b981', fontWeight: 700 }}>
                    {t.pdb || 'N/A'}
                  </span>
                </div>

                <div className="target-detail-row">
                  <span className="td-label">Reported Affinity:</span>
                  <span className="td-val">{t.potency || 'Sub-micromolar'}</span>
                </div>

                <div className="target-detail-row">
                  <span className="td-label">Action Mechanism:</span>
                  <span className="td-val" style={{ fontSize: '0.75rem' }}>
                    {t.mechanism || 'Inhibition'}
                  </span>
                </div>
              </div>
            </div>

            {/* 1-Click Bridge Actions */}
            <div className="target-bridges-row">
              {navigate && (
                <>
                  <button
                    className="bridge-btn biostructure"
                    title={`Inspect 3D structure ${t.pdb || ''} in BioStructure Hub`}
                    onClick={() => navigate('biostructure')}
                  >
                    <Dna size={14} /> 3D BioStructure
                  </button>
                  <button
                    className="bridge-btn dti"
                    title={`Run machine learning interaction prediction against ${t.name}`}
                    onClick={() => navigate('dti')}
                  >
                    <FlaskConical size={14} /> DTI Lab
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
