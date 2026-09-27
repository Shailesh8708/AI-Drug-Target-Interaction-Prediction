import { Activity, Clock, ShieldAlert, Heart, Layers, ArrowDown } from 'lucide-react'

export default function ADMEPharmacologyPanel({ drug }) {
  if (!drug) return null

  const adme = drug.adme || {
    absorption: 'High (HIA 95%)',
    caco2: 'High (Papp > 10 cm/s)',
    bbb: 'Moderate',
    plasmaProteinBinding: '60%',
    volumeOfDistribution: '1.2 L/kg',
    cypPathways: ['CYP3A4', 'CYP2D6'],
    clearance: 'Moderate (renal / biliary)',
    halfLife: '4-6 hours',
    hergRisk: 'Low Risk',
  }

  const moaSteps = drug.moaSteps || [
    {
      step: 1,
      title: 'Oral Administration & Intestinal Uptake',
      description: 'The molecule is rapidly absorbed across the gastrointestinal mucosal epithelium via passive non-ionic diffusion and transporter-mediated influx.',
    },
    {
      step: 2,
      title: 'Systemic Distribution & Plasma Binding',
      description: 'Reversible binding to serum albumin with a fraction of unbound active compound distributing across extracellular fluid and target tissues.',
    },
    {
      step: 3,
      title: 'Target Binding & Pocket Stabilization',
      description: 'Docking into the macromolecular binding pocket with stereospecific hydrogen bonding, hydrophobic contacts, and coordination networks.',
    },
    {
      step: 4,
      title: 'Enzymatic or Receptor Modulation',
      description: 'Competitive or allosteric inhibition of downstream catalytic turnover, preventing physiological substrate conversion or signal propagation.',
    },
    {
      step: 5,
      title: 'Cellular Therapeutic Output',
      description: 'Suppression of downstream pathological cascades, eliciting the clinical anti-inflammatory, antibacterial, or antiproliferative response.',
    },
    {
      step: 6,
      title: 'Hepatic Biotransformation & Elimination',
      description: 'Phase I CYP oxidation and Phase II glucuronidation facilitating terminal clearance via renal filtration and biliary excretion.',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel-subheading">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#10b981" />
          ADMET Pharmacokinetics & Mechanism of Action (MoA)
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Simulated & Clinical Pharmacological Profiles
        </span>
      </div>

      {/* ADMET Metrics Grid */}
      <div className="adme-grid">
        <div className="adme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Absorption (A)</span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#f1f5f9' }}>{adme.absorption}</strong>
          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Caco-2: {adme.caco2 || 'Moderate'}</small>
        </div>

        <div className="adme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Distribution (D)</span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#f1f5f9' }}>Vd: {adme.volumeOfDistribution}</strong>
          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>PPB: {adme.plasmaProteinBinding}</small>
        </div>

        <div className="adme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Blood-Brain Barrier (BBB)</span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#f1f5f9' }}>{adme.bbb}</strong>
          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>CNS Penetration Level</small>
        </div>

        <div className="adme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Metabolism (M)</span>
          </div>
          <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
            {adme.cypPathways?.join(', ') || 'CYP isozymes'}
          </strong>
          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Primary Isozymes</small>
        </div>

        <div className="adme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Elimination (E)</span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#f1f5f9' }}>t1/2: {adme.halfLife}</strong>
          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Clearance: {adme.clearance}</small>
        </div>

        <div className="adme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <Heart size={12} color="#ef4444" />
            <span>Cardiotoxicity (hERG)</span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: adme.hergRisk?.includes('Low') ? '#10b981' : '#f59e0b' }}>
            {adme.hergRisk}
          </strong>
          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>QT Prolongation Screening</small>
        </div>
      </div>

      {/* 6-Step Mechanism of Action Timeline */}
      <div className="structure-panel-box">
        <h4 style={{ margin: '0 0 0.85rem', fontSize: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#38bdf8" />
          Mechanism of Action (MoA) Biological Timeline
        </h4>

        <div className="moa-timeline-wrap">
          {moaSteps.map((step) => (
            <div key={step.step} className="moa-step-item">
              <div className="step-number-bubble">{step.step}</div>
              <div className="step-content-box">
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
