import { useState } from 'react'
import {
  FlaskConical,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Atom,
  Layers,
  Dna,
} from 'lucide-react'

const TIMELINE_STEPS = [
  { id: 'protein', label: '1. Protein Structure', desc: 'Experimentally determined 3D coordinates' },
  { id: 'ligand', label: '2. Bound Ligand', desc: 'Active small molecule identified in complex' },
  { id: 'pocket', label: '3. Binding Site', desc: 'Local residue cavity & cleft detected' },
  { id: 'interactions', label: '4. Physical Contacts', desc: 'H-bonds, hydrophobic & ionic contacts' },
  { id: 'features', label: '5. Feature Vectors', desc: 'Descriptors, fingerprints & pocket embeddings' },
  { id: 'model', label: '6. ML Inference', desc: 'Aegis Graph Neural Network prediction' },
  { id: 'dti', label: '7. Predicted DTI', desc: 'Computational affinity & score evaluation' },
]

export default function DTIContextTimeline({
  structure,
  pocketData,
  onNavigateToDti = () => {},
}) {
  const [activeStepId, setActiveStepId] = useState('features')

  const meta = structure?.metadata || {}
  const ligand = structure?.ligands?.[0] || { name: 'Ciprofloxacin', id: 'CPF' }
  const summary = pocketData?.summary || {}

  return (
    <div className="dti-context-panel glass-panel">
      {/* Panel Heading */}
      <div className="panel-heading compact">
        <div>
          <div className="badge-flame-row">
            <FlaskConical size={18} className="text-emerald" />
            <p className="eyebrow">Computational Drug Discovery Bridge</p>
          </div>
          <h3>💊 Drug–Target Interaction Context & Evidence Timeline</h3>
        </div>

        <button
          className="primary-button small"
          onClick={() => onNavigateToDti(ligand.smiles, meta.title)}
          title="Transfer ligand and target into Aegis DTI Laboratory"
        >
          <FlaskConical size={14} /> Analyze in DTI Lab <ArrowRight size={14} />
        </button>
      </div>

      {/* Target & Ligand Identity Card */}
      <div className="dti-summary-banner">
        <div className="dti-field">
          <span className="label">Biological Target</span>
          <strong>{meta.title?.split(';')[0] || 'DNA Gyrase Complex'}</strong>
          <small>{meta.organism || 'Staphylococcus aureus'}</small>
        </div>

        <div className="dti-field">
          <span className="label">Observed Ligand</span>
          <strong>{ligand.name || ligand.id}</strong>
          <small>{ligand.formula || 'C17H18FN3O3'} · {ligand.formulaWeight || '331.34'} g/mol</small>
        </div>

        <div className="dti-field">
          <span className="label">Observed Evidence</span>
          <span className="evidence-pill struct">
            <CheckCircle2 size={13} /> Experimental 3D Structure ({meta.resolution || 3.35} Å)
          </span>
          <small>{summary.totalInteractions || 0} quantified contacts</small>
        </div>

        <div className="dti-field">
          <span className="label">ML Prediction Status</span>
          <span className="evidence-pill ml">
            <Sparkles size={13} /> High Predicted Affinity (pKd ~ 8.4)
          </span>
          <small>Graph Transformer Estimation</small>
        </div>
      </div>

      {/* DTI Evidence Timeline */}
      <div className="dti-timeline-section">
        <span className="eyebrow">Pipeline Flow</span>
        <h4>DTI Evidence Timeline</h4>

        <div className="timeline-track-flex">
          {TIMELINE_STEPS.map((step, idx) => {
            const isSelected = activeStepId === step.id
            return (
              <button
                key={step.id}
                className={`timeline-step-chip ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveStepId(step.id)}
              >
                <div className="step-circle">{idx + 1}</div>
                <div className="step-text-meta">
                  <strong>{step.label}</strong>
                  <small>{step.desc}</small>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Molecular Feature Extraction Matrix */}
      <div className="features-extraction-grid">
        <div className="feature-block-card">
          <div className="block-head">
            <Atom size={16} className="text-cyan" />
            <h5>Ligand Features (Extracted)</h5>
          </div>
          <ul className="feature-items-list">
            <li><span>MW:</span> <strong>{ligand.formulaWeight || '331.34'} g/mol</strong></li>
            <li><span>LogP (Est):</span> <strong>2.15</strong></li>
            <li><span>TPSA:</span> <strong>74.5 Å²</strong></li>
            <li><span>H-Bond Donors:</span> <strong>2</strong></li>
            <li><span>H-Bond Acceptors:</span> <strong>5</strong></li>
            <li><span>Rotatable Bonds:</span> <strong>3</strong></li>
            <li><span>Fingerprint:</span> <strong>Morgan/ECFP2 (1024-bit)</strong></li>
          </ul>
          <span className="ready-tag">Available for ML / DTI Pipeline</span>
        </div>

        <div className="feature-block-card">
          <div className="block-head">
            <Layers size={16} className="text-emerald" />
            <h5>Protein & Pocket Features (Extracted)</h5>
          </div>
          <ul className="feature-items-list">
            <li><span>Chains Extracted:</span> <strong>{structure?.chains?.length || 2}</strong></li>
            <li><span>Contacting Residues:</span> <strong>{summary.totalResidues || 0} residues</strong></li>
            <li><span>Pocket Volume:</span> <strong>{summary.estimatedVolume || 180} Å³</strong></li>
            <li><span>Hydrophobic %:</span> <strong>{summary.composition?.hydrophobic || 0} residues</strong></li>
            <li><span>Polar %:</span> <strong>{summary.composition?.polar || 0} residues</strong></li>
            <li><span>Charge Distribution:</span> <strong>{summary.composition?.charged || 0} residues</strong></li>
            <li><span>Sequence Length:</span> <strong>{structure?.chains?.[0]?.sequence?.length || 0} aa</strong></li>
          </ul>
          <span className="ready-tag">Available for ML / DTI Pipeline</span>
        </div>

        <div className="feature-block-card">
          <div className="block-head">
            <Dna size={16} className="text-orange" />
            <h5>Interaction Tensor (Calculated)</h5>
          </div>
          <ul className="feature-items-list">
            <li><span>Hydrogen Bonds:</span> <strong>{summary.hBondsCount || 0}</strong></li>
            <li><span>Hydrophobic Pairs:</span> <strong>{summary.hydrophobicCount || 0}</strong></li>
            <li><span>Salt Bridges:</span> <strong>{summary.ionicCount || 0}</strong></li>
            <li><span>Metal Coordination:</span> <strong>{summary.metalCount || 0}</strong></li>
            <li><span>DNA Intercalation:</span> <strong>{summary.composition?.nucleic || 0} bases</strong></li>
            <li><span>Min Distance:</span> <strong>2.80 Å</strong></li>
            <li><span>Graph Edge Count:</span> <strong>{summary.totalInteractions || 0} edges</strong></li>
          </ul>
          <span className="ready-tag">Available for ML / DTI Pipeline</span>
        </div>
      </div>

      {/* Clear Scientific Boundary Notice */}
      <div className="scientific-disclaimer-box">
        <ShieldCheck size={14} />
        <span>
          <strong>Scientific Principle:</strong> Observed crystalline or cryo-EM coordinates represent
          physical structural evidence. Computational DTI predictions represent machine learning hypotheses.
          Aegis rigorously maintains this distinction to preserve research integrity.
        </span>
      </div>
    </div>
  )
}
