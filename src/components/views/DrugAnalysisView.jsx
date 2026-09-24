import { useState } from 'react'
import { Pill, ShieldCheck, Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'

const DRUG_RECORDS = [
  {
    id: 'd1',
    name: 'Cetirizine',
    class: 'Second-generation Antihistamine',
    smiles: 'ClC1=CC=C(C(C2=CC=CC=C2)N3CCN(CCOCC(=O)O)CC3)C=C1',
    absorption: 'High (HIA 94%)',
    bbb: 'Low (P-gp substrate, non-sedating)',
    solubility: '-3.12 LogS (Soluble)',
    cyp3a4: 'Non-inhibitor',
    hergRisk: 'Low Risk',
  },
  {
    id: 'd2',
    name: 'Paracetamol (Acetaminophen)',
    class: 'Analgesic / Antipyretic',
    smiles: 'CC(=O)NC1=CC=C(O)C=C1',
    absorption: 'High (HIA 98%)',
    bbb: 'Moderate (Crosses BBB)',
    solubility: '-1.45 LogS (High)',
    cyp3a4: 'Non-inhibitor (CYP2E1 pathway)',
    hergRisk: 'Low Risk',
  },
  {
    id: 'd3',
    name: 'Imatinib Mesylate',
    class: 'Tyrosine Kinase Inhibitor',
    smiles: 'Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5',
    absorption: 'Moderate (HIA 78%)',
    bbb: 'Poor (Effluxed by ABCB1)',
    solubility: '-4.65 LogS (Moderate)',
    cyp3a4: 'Strong Inhibitor',
    hergRisk: 'Moderate Risk',
  },
]

export default function DrugAnalysisView({ setNotice }) {
  const [selectedDrug, setSelectedDrug] = useState(DRUG_RECORDS[0])

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Pharmacological Profiling</p>
          <h1>Drug Analysis</h1>
          <p className="intro-copy">
            Evaluate bioactivity profiles, simulated ADMET characteristics, and computational safety thresholds.
          </p>
        </div>
        <button
          className="primary-button small"
          onClick={() => setNotice('ADMET simulation calibrated against SwissADME & ChEMBL models')}
        >
          <Activity size={15} /> Run ADMET Scan
        </button>
      </div>

      <div className="lab-grid">
        {/* Left: Drug Chemotype & ADMET Card */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Selected Compound</p>
              <h3>{selectedDrug.name}</h3>
            </div>
            <span className="draft-badge">{selectedDrug.class}</span>
          </div>

          <p style={{ fontSize: '11px', color: '#66746b', fontFamily: 'monospace', wordBreak: 'break-all', background: '#f5f7f3', padding: '10px', borderRadius: '4px' }}>
            {selectedDrug.smiles}
          </p>

          <h4 style={{ fontSize: '12px', margin: '16px 0 8px', color: '#55635a' }}>Simulated ADMET Parameters</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf0ec', fontSize: '11px' }}>
              <span style={{ color: '#748078' }}>Intestinal Absorption (HIA)</span>
              <strong>{selectedDrug.absorption}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf0ec', fontSize: '11px' }}>
              <span style={{ color: '#748078' }}>Blood-Brain Barrier (BBB)</span>
              <strong>{selectedDrug.bbb}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf0ec', fontSize: '11px' }}>
              <span style={{ color: '#748078' }}>Aqueous Solubility (LogS)</span>
              <strong>{selectedDrug.solubility}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf0ec', fontSize: '11px' }}>
              <span style={{ color: '#748078' }}>CYP3A4 Inhibition</span>
              <strong>{selectedDrug.cyp3a4}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf0ec', fontSize: '11px' }}>
              <span style={{ color: '#748078' }}>hERG Cardiotoxicity Risk</span>
              <span className={`status-pill ${selectedDrug.hergRisk.includes('Low') ? 'active' : 'warning'}`}>
                {selectedDrug.hergRisk}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Compound Registry */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Registry</p>
              <h3>Screened Compounds</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DRUG_RECORDS.map((drug) => (
              <div
                key={drug.id}
                onClick={() => setSelectedDrug(drug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: selectedDrug.id === drug.id ? '#eef5ee' : '#fcfdfb',
                  border: `1px solid ${selectedDrug.id === drug.id ? '#cdded0' : '#edf0ec'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#e2f0e4', display: 'grid', placeItems: 'center', color: '#397654' }}>
                  <Pill size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '12px' }}>{drug.name}</strong>
                  <small style={{ color: '#89958d', fontSize: '10px' }}>{drug.class}</small>
                </div>
                <ChevronRight size={16} color="#a0aba4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <ShieldCheck size={18} />
        <p>
          <strong>Non-Clinical Simulation Notice</strong> ADMET screening values are generated by in-silico quantitative structure-activity relationship (QSAR) models and must never replace pharmacokinetic or toxicology testing in clinical laboratories.
        </p>
      </div>
    </div>
  )
}
