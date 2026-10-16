import {
  Dna,
  FlaskConical,
  GitCompare,
  Database,
  Bell,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Atom,
} from 'lucide-react'

const CAPABILITIES = [
  {
    id: 'biostructure',
    title: 'BioStructure Intelligence Hub',
    subtitle: 'Macromolecular 3D Visualization & Analysis',
    description:
      'Interactive 3D macromolecular engine supporting authentic RCSB PDB coordinate loading, secondary structure segmentation, binding pocket detection, Ramachandran validation, and PhD-level biophysical metrics.',
    tag: 'RCSB PDB INTEGRATION',
    icon: Dna,
    accent: 'cyan',
    badge: 'Authentic 3D PDB',
    actionText: 'Launch BioStructure Hub',
  },
  {
    id: 'dti',
    title: 'DTI Neural Prediction Lab',
    subtitle: 'AI Binding Affinity Screening',
    description:
      'Neural network screening pipeline computing 256-bit topological Morgan fingerprints and 20-amino-acid normalized composition vectors with explainable feature attribution and benchmark threshold scoring.',
    tag: 'DEEP LEARNING PIPELINE',
    icon: FlaskConical,
    accent: 'emerald',
    badge: 'Neural Screening',
    actionText: 'Screen Target Interactions',
  },
  {
    id: 'compare',
    title: 'Comparative Structural Chemistry',
    subtitle: 'Dual 3D/2D Molecular Alignment',
    description:
      'Side-by-side molecular comparison computing Maximum Common Substructures (MCS), atom/bond delta mapping, and topological Tanimoto similarity coefficients across bioactive chemotypes.',
    tag: 'STRUCTURAL COMPARISON',
    icon: GitCompare,
    accent: 'violet',
    badge: 'MCS & Tanimoto',
    actionText: 'Compare Compound Graphs',
  },
  {
    id: 'integrations',
    title: 'Scientific Data Hub',
    subtitle: '7 Federated Biomedical Databases',
    description:
      'Unified cross-referencing engine querying RCSB PDB, UniProt, AlphaFold DB, PubChem, ChEMBL, PubMed, and ClinicalTrials.gov with normalized schemas and experimental vs predicted provenance tags.',
    tag: 'FEDERATED REPOSITORIES',
    icon: Database,
    accent: 'blue',
    badge: '7 Scientific DBs',
    actionText: 'Explore Data Hub',
  },
  {
    id: 'expiry',
    title: 'Expiry & Stability Surveillance',
    subtitle: 'Active Compound Inventory Monitoring',
    description:
      'Comprehensive inventory monitor tracking reagent degradation timelines, automated 7-day shelf-life threshold alerts, and compliance protocols for laboratory compounds.',
    tag: 'INVENTORY SAFETY',
    icon: Bell,
    accent: 'orange',
    badge: 'Safety Alerts',
    actionText: 'Monitor Expiry Timelines',
  },
]

export default function OverviewCapabilitiesSection({ navigate }) {
  return (
    <section className="cinematic-chapter-section" id="capabilities-section">
      <div className="chapter-inner-content">
        <div className="chapter-header-badge">
          <Sparkles size={14} className="chapter-badge-icon" />
          <span>SECTION D · PLATFORM RESEARCH CAPABILITIES</span>
        </div>

        <h2 className="chapter-title">
          <span>Integrated Molecular</span>
          <span className="accent-text-glow"> Intelligence Suite.</span>
        </h2>

        <p className="chapter-lead-text">
          Explore specialized modules engineered for computational biology,
          biophysical validation, neural interaction prediction, and laboratory organization.
        </p>

        <div className="capabilities-cinematic-grid">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon
            return (
              <div
                key={cap.id}
                className={`capability-card-cinematic accent-${cap.accent}`}
                onClick={() => navigate(cap.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(cap.id)}
                aria-label={`Open ${cap.title}`}
              >
                <div className="capability-card-glow" />
                <div className="capability-card-header">
                  <div className="capability-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <span className="capability-tag">{cap.tag}</span>
                </div>

                <div className="capability-card-body">
                  <span className="capability-subtitle">{cap.subtitle}</span>
                  <h3 className="capability-title">{cap.title}</h3>
                  <p className="capability-desc">{cap.description}</p>
                </div>

                <div className="capability-card-footer">
                  <span className="capability-badge-pill">{cap.badge}</span>
                  <div className="capability-action-link">
                    <span>{cap.actionText}</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

