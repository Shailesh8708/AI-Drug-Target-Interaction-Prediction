import { ArrowUpRight, Dna, FlaskConical, Database, Sparkles, ShieldCheck } from 'lucide-react'

export default function OverviewClosingSection({ navigate }) {
  return (
    <section className="cinematic-chapter-section closing-section-wrapper" id="closing-section">
      <div className="chapter-inner-content text-center-content">
        <div className="closing-badge">
          <Sparkles size={14} className="closing-sparkle-icon" />
          <span>AEGIS PHARMACEUTICAL RESEARCH PLATFORM</span>
        </div>

        <h2 className="closing-title">
          <span>Your Next Discovery</span>
          <span className="accent-text-glow"> Starts Here.</span>
        </h2>

        <p className="closing-subtext">
          Explore molecular structures, investigate compounds, and bring your
          pharmaceutical research workflow together in one intelligent environment.
        </p>

        <div className="closing-action-grid">
          <button
            className="cinematic-btn primary-glow-btn large-cta-btn"
            onClick={() => navigate('biostructure')}
            aria-label="Enter BioStructure Intelligence Hub"
          >
            <Dna size={18} />
            <span>Explore BioStructure Hub</span>
            <ArrowUpRight size={17} />
          </button>

          <button
            className="cinematic-btn secondary-ghost-btn large-cta-btn"
            onClick={() => navigate('dti')}
            aria-label="Launch DTI Neural Lab"
          >
            <FlaskConical size={18} />
            <span>Launch DTI Lab</span>
            <ArrowUpRight size={17} />
          </button>

          <button
            className="cinematic-btn secondary-ghost-btn large-cta-btn"
            onClick={() => navigate('integrations')}
            aria-label="Open Scientific Data Hub"
          >
            <Database size={18} />
            <span>Open Scientific Data Hub</span>
            <ArrowUpRight size={17} />
          </button>
        </div>

        <div className="closing-platform-meta">
          <div className="meta-badge-item">
            <span className="meta-dot green" />
            <span>AUTHENTIC PDB & UNIPROT INTEGRATIONS</span>
          </div>
          <div className="meta-badge-item">
            <span className="meta-dot rust" />
            <span>DTI MORGAN TOPOLOGICAL PIPELINE</span>
          </div>
          <div className="meta-badge-item">
            <span className="meta-dot amber" />
            <span>PhD-LEVEL BIOPHYSICAL ANALYSIS</span>
          </div>
        </div>

        <div className="closing-watermark">
          <span>AEGIS COMPUTATIONAL BIOLOGY PLATFORM · BUILD 2026.09 · PHASE 01 ACTIVE</span>
        </div>
      </div>
    </section>
  )
}

