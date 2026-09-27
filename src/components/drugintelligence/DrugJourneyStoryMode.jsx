import { useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Play, Pause, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react'

export default function DrugJourneyStoryMode({ drug, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  const steps = [
    {
      title: '1. Discovery & Origin',
      subtitle: 'From synthetic rationale to laboratory synthesis',
      body: `${drug?.name} emerged as a cornerstone therapeutic compound, developed through targeted rational drug design to overcome pharmacokinetic and selectivity limitations of earlier lead generations.`,
    },
    {
      title: '2. Chemical Architecture & Synthesis',
      subtitle: 'Molecular formula, scaffold geometry, and valence harmony',
      body: `With chemical formula ${drug?.formula || 'N/A'} and molecular weight ${drug?.mw?.toFixed(1) || 'N/A'} g/mol, the molecule features a rigid core scaffold (${drug?.murckoScaffold || 'aromatic ring systems'}) decorated with functional groups designed to balance lipophilicity with aqueous solubility.`,
    },
    {
      title: '3. Oral Delivery & Epithelial Absorption',
      subtitle: 'Crossing biological mucosal membranes',
      body: `Upon administration, the compound enters the gastrointestinal lumen. Exhibiting ${drug?.adme?.absorption || 'high'} absorption, its physicochemical profile allows efficient passive transcellular diffusion across intestinal enterocyte membranes into the portal circulation.`,
    },
    {
      title: '4. Systemic Circulation & Distribution',
      subtitle: 'Transporting through bloodstream and extracellular compartments',
      body: `The molecule binds reversibly to circulating serum albumin (${drug?.adme?.plasmaProteinBinding || 'plasma binding'}). The free active fraction distributes throughout vascular beds and interstitial fluid with a volume of distribution (Vd) of ${drug?.adme?.volumeOfDistribution || '1.0 L/kg'}.`,
    },
    {
      title: '5. Blood-Brain Barrier & Tissue Partitioning',
      subtitle: 'Selective biological barriers and organ accessibility',
      body: `The compound's penetration across the Blood-Brain Barrier (BBB) is rated as "${drug?.adme?.bbb || 'Moderate'}". Specific efflux transporters (such as P-glycoprotein) and polar surface area dictate its relative partitioning between peripheral and central nervous systems.`,
    },
    {
      title: '6. Macromolecular Target Recognition',
      subtitle: 'Docking into the protein binding pocket',
      body: `Reaching its biological destination, the molecule docks stereospecifically into the active site of ${drug?.targets?.[0]?.name || 'its primary macromolecular target'}. Hydrogen bonds, pi-pi stacking, and electrostatic networks anchor the ligand tightly (potency: ${drug?.targets?.[0]?.potency || 'sub-micromolar'}).`,
    },
    {
      title: '7. Cellular Modulation & Therapeutic Response',
      subtitle: 'Halting pathological cascades at the cellular level',
      body: `By ${drug?.targets?.[0]?.mechanism || 'inhibiting target enzymatic activity'}, the drug halts pathological enzymatic turnover or receptor signal transduction, providing definitive therapeutic relief for approved indications like ${drug?.indications?.[0] || 'clinical pathology'}.`,
    },
    {
      title: '8. Hepatic Biotransformation & Metabolism',
      subtitle: 'Phase I oxidation and Phase II conjugation',
      body: `Systemic clearance proceeds primarily via hepatic cytochrome P450 isozymes (${drug?.adme?.cypPathways?.join(', ') || 'CYP enzymes'}). Enzymatic hydroxylation and glucuronide conjugation transform the lipophilic drug into polar, water-soluble metabolites.`,
    },
    {
      title: '9. Elimination & Clearance Half-Life',
      subtitle: 'Excretion from biological systems',
      body: `With an elimination half-life of ${drug?.adme?.halfLife || 'several hours'}, hydrophilic metabolites and unchanged drug undergo filtration and active secretion through ${drug?.adme?.clearance || 'renal and biliary pathways'}, terminating systemic pharmacological exposure.`,
    },
    {
      title: '10. AI-Assisted Future & Next-Gen Analogues',
      subtitle: 'In-silico optimization and structural evolution',
      body: `Using deep learning DTI models and structural biology platforms like AEGIS Molecular Lab, researchers can now simulate targeted congener substitutions to overcome resistance mutations, increase target residence time, and minimize adverse toxicities.`,
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const s = steps[currentStep]

  return (
    <div className="journey-shell">
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="#10b981" />
          The Molecular Journey of {drug?.name} (10-Step Story Mode)
        </h3>
        {onClose && (
          <button className="action-btn-pill" onClick={onClose}>
            Exit Journey
          </button>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="journey-progress-bar">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`journey-step-indicator ${
              i === currentStep ? 'active' : i < currentStep ? 'completed' : ''
            }`}
            onClick={() => setCurrentStep(i)}
            style={{ cursor: 'pointer' }}
            title={`Step ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide Card */}
      <div className="journey-slide-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Chapter {currentStep + 1} of 10
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.subtitle}</span>
        </div>

        <h3>{s.title}</h3>
        <p>{s.body}</p>
      </div>

      {/* Controls */}
      <div className="journey-nav-controls">
        <button
          className="action-btn-pill"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft size={16} /> Previous Chapter
        </button>

        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Step {currentStep + 1} / 10
        </span>

        <button
          className="action-btn-pill primary"
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          Next Chapter <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
