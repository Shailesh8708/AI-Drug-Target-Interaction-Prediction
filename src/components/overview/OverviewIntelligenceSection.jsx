import { BrainCircuit, FlaskConical, ArrowUpRight, CheckCircle2, Cpu, Sparkles } from 'lucide-react'

export default function OverviewIntelligenceSection({ navigate }) {
  return (
    <section className="cinematic-chapter-section" id="intelligence-section">
      <div className="chapter-inner-content">
        <div className="chapter-header-badge">
          <BrainCircuit size={14} className="chapter-badge-icon" />
          <span>SECTION C · DRUG DISCOVERY INTELLIGENCE</span>
        </div>

        <h2 className="chapter-title">
          <span>Where Deep Learning Meets</span>
          <span className="accent-text-cyan"> Target Biology.</span>
        </h2>

        <p className="chapter-lead-text">
          Predicting binding affinity across vast chemical spaces. AEGIS bridges
          256-bit topological Morgan fingerprints with 20-amino-acid normalized
          protein composition to evaluate drug–target candidate interactions in milliseconds.
        </p>

        <div className="intelligence-spotlight-card">
          <div className="spotlight-header">
            <div className="spotlight-title-group">
              <span className="spotlight-eyebrow">BENCHMARK INTERACTION STUDY</span>
              <h3>Imatinib (STI-571) ⇄ Tyrosine-Protein Kinase ABL1</h3>
            </div>
            <div className="affinity-badge active-affinity">
              <CheckCircle2 size={14} />
              <span>Kd: 12.4 nM · High Affinity Active</span>
            </div>
          </div>

          <div className="spotlight-grid">
            <div className="spotlight-subpanel compound-subpanel">
              <div className="subpanel-tag">
                <FlaskConical size={13} />
                <span>CANDIDATE SMALL MOLECULE</span>
              </div>
              <div className="compound-spec">
                <strong>Imatinib</strong>
                <small className="mono-text">SMILES: Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5</small>
                <div className="spec-meta-row">
                  <span>MW: <strong>493.6 g/mol</strong></span>
                  <span>H-BOND DONORS: <strong>2</strong></span>
                  <span>H-BOND ACCEPTORS: <strong>7</strong></span>
                  <span>LOGP: <strong>3.49</strong></span>
                </div>
              </div>
              <div className="feature-attribution-block">
                <span className="attr-title">NEURAL FEATURE ATTRIBUTION</span>
                <div className="attr-bar-row">
                  <span>Aromatic Ring π-Stacking</span>
                  <div className="attr-track"><div className="attr-fill" style={{ width: '84%' }} /></div>
                  <strong>+0.84</strong>
                </div>
                <div className="attr-bar-row">
                  <span>H-Bond Donor (Met318 Gatekeeper)</span>
                  <div className="attr-track"><div className="attr-fill" style={{ width: '76%' }} /></div>
                  <strong>+0.76</strong>
                </div>
                <div className="attr-bar-row">
                  <span>Piperazine Solvation Tail</span>
                  <div className="attr-track"><div className="attr-fill" style={{ width: '52%' }} /></div>
                  <strong>+0.52</strong>
                </div>
              </div>
            </div>

            <div className="spotlight-subpanel target-subpanel">
              <div className="subpanel-tag">
                <Cpu size={13} />
                <span>TARGET RECEPTOR ARCHITECTURE</span>
              </div>
              <div className="target-spec">
                <strong>Human Proto-Oncogene Tyrosine-Protein Kinase ABL1</strong>
                <small className="mono-text">UniProt: P00519 · PDB Reference: 2XCT / 1IEP</small>
                <div className="spec-meta-row">
                  <span>SEQUENCE: <strong>1,130 AA</strong></span>
                  <span>DOMAIN: <strong>Kinase (242–493)</strong></span>
                  <span>ORGANISM: <strong>Homo sapiens</strong></span>
                </div>
              </div>

              <div className="docking-telemetry-box">
                <div className="telemetry-stat">
                  <small>PREDICTED AFFINITY</small>
                  <strong className="stat-highlight">Kd = 12.4 nM</strong>
                </div>
                <div className="telemetry-stat">
                  <small>BENCHMARK THRESHOLD</small>
                  <strong>≤ 10 µM (Passed)</strong>
                </div>
                <div className="telemetry-stat">
                  <small>INFERENCE LATENCY</small>
                  <strong>18.4 ms</strong>
                </div>
              </div>

              <div className="spotlight-action-row">
                <button
                  className="cinematic-btn primary-glow-btn small-btn"
                  onClick={() => navigate('dti')}
                  aria-label="Open DTI Lab with Imatinib and ABL1"
                >
                  <FlaskConical size={14} />
                  <span>Launch DTI Neural Lab</span>
                  <ArrowUpRight size={14} />
                </button>
                <button
                  className="cinematic-btn secondary-ghost-btn small-btn"
                  onClick={() => navigate('biostructure')}
                  aria-label="Inspect 2XCT BioStructure"
                >
                  <Sparkles size={14} />
                  <span>Inspect 2XCT Structure</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

