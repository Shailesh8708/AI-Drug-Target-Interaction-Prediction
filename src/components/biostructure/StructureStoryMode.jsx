import { useState } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  Layers,
  Target,
  Pill,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export const STORY_STEPS = [
  {
    step: 1,
    title: 'Protein Structure Architecture',
    camera: 'protein',
    highlight: 'protein',
    subtitle: 'High-order polypeptide scaffold & symmetry',
    content: (structure) =>
      `This complex comprises ${structure?.chains?.filter((c) => c.type === 'protein').length || 2} protein chains acting as functional enzymatic subunits from ${structure?.metadata?.organism || 'the target organism'}. The structural backbone forms alpha-helices and beta-sheets establishing the global tertiary fold.`,
  },
  {
    step: 2,
    title: 'Target Binding Region & DNA Intercalation',
    camera: 'dna',
    highlight: 'dna',
    subtitle: 'Catalytic cleavage domain & nucleic acid core',
    content: (structure) =>
      `The enzyme recognizes and cleaves target double-stranded DNA (${structure?.chains?.filter((c) => c.type === 'dna').length || 2} nucleic chains). The active site presents an open cleft where phosphodiester backbone cleavage takes place.`,
  },
  {
    step: 3,
    title: 'Bound Small Molecule Ligand',
    camera: 'ligand',
    highlight: 'ligand',
    subtitle: 'Inhibitor binding at the active interface',
    content: (structure) =>
      `The small molecule inhibitor ${structure?.ligands?.[0]?.name || 'ligand'} binds directly into the scissile cleavage gap. The compound occupies the space between cleaved DNA base pairs, acting as a molecular wedge.`,
  },
  {
    step: 4,
    title: 'Binding Pocket Microenvironment',
    camera: 'pocket',
    highlight: 'pocket',
    subtitle: 'Local amino acid & nucleic acid residue shell',
    content: (_structure, pocket) =>
      `The binding pocket spans ${pocket?.summary?.totalResidues || 'multiple'} contacting residues within a 4.5 Å radius. The surrounding residues create a tailored electrostatic and desolvation environment.`,
  },
  {
    step: 5,
    title: 'Specific Residue Contacts & Interactions',
    camera: 'pocket',
    highlight: 'interactions',
    subtitle: 'Directional hydrogen bonds & hydrophobic anchor points',
    content: (_structure, pocket) =>
      `The complex is held by ${pocket?.summary?.hBondsCount || 0} hydrogen bonds, ${pocket?.summary?.hydrophobicCount || 0} non-polar hydrophobic contacts, and metal coordination bonds that fix the ligand orientation.`,
  },
  {
    step: 6,
    title: 'Structural Interpretation & Mechanism',
    camera: 'full',
    highlight: 'none',
    subtitle: 'Grounded computational interpretation',
    content: () =>
      'By stabilizing the cleaved DNA intermediate and blocking religation, this ternary complex traps the enzyme in a lethal state, preventing bacterial replication.',
  },
  {
    step: 7,
    title: 'Drug–Target Interaction (DTI) Context',
    camera: 'full',
    highlight: 'dti',
    subtitle: 'Bridge from structural biology to ML prediction',
    content: () =>
      'Observed crystalline binding contacts provide atomic-level features (contact counts, SASA, interaction vectors) ready to feed directly into the Aegis DTI Graph Neural Network.',
  },
]

export default function StructureStoryMode({
  structure,
  pocketData,
  onStepChange = () => {},
  onClose = () => {},
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const activeStep = STORY_STEPS[currentStepIndex]

  const handleNext = () => {
    if (currentStepIndex < STORY_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1
      setCurrentStepIndex(nextIdx)
      onStepChange(STORY_STEPS[nextIdx])
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1
      setCurrentStepIndex(prevIdx)
      onStepChange(STORY_STEPS[prevIdx])
    }
  }

  const handleSelectStep = (idx) => {
    setCurrentStepIndex(idx)
    onStepChange(STORY_STEPS[idx])
  }

  return (
    <div className="structure-story-overlay glass-panel">
      {/* Step Progress Bar */}
      <div className="story-step-indicator">
        <div className="story-title-row">
          <div className="story-badge">
            <BookOpen size={15} />
            <span>Structure Story · Step {activeStep.step} of {STORY_STEPS.length}</span>
          </div>
          <button className="quiet-button small" onClick={onClose}>
            Exit Story Mode
          </button>
        </div>

        <div className="story-step-pills">
          {STORY_STEPS.map((s, idx) => (
            <button
              key={s.step}
              className={`step-pill ${idx === currentStepIndex ? 'active' : idx < currentStepIndex ? 'completed' : ''}`}
              onClick={() => handleSelectStep(idx)}
              title={s.title}
            >
              <span>{s.step}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Content */}
      <div className="story-step-card">
        <span className="step-subtitle">{activeStep.subtitle}</span>
        <h3>{activeStep.title}</h3>
        <p className="step-copy">{activeStep.content(structure, pocketData)}</p>

        {/* Navigation Controls */}
        <div className="story-controls">
          <button
            className="tool-button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="step-counter">
            {currentStepIndex + 1} / {STORY_STEPS.length}
          </span>
          <button
            className="primary-button small"
            onClick={handleNext}
            disabled={currentStepIndex === STORY_STEPS.length - 1}
          >
            Next Step <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
