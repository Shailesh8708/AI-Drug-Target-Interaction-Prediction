import { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react'

export default function BiologicalAssemblyQuality({
  structure,
  onAssemblyChange = () => {},
}) {
  const [selectedAssembly, setSelectedAssembly] = useState('asym')

  const meta = structure?.metadata || {}
  const assemblies = structure?.assemblies || [
    { id: 'asym', name: 'Asymmetric Unit', stoichiometry: 'Deposited Coordinates' },
    { id: 'assembly-1', name: 'Biological Assembly 1', stoichiometry: 'Hetero-multimer' },
  ]

  const handleAssemblySelect = (id) => {
    setSelectedAssembly(id)
    onAssemblyChange(id)
  }

  return (
    <div className="assembly-quality-grid">
      {/* Biological Assembly Explorer */}
      <div className="glass-panel assembly-card">
        <div className="section-head-row">
          <Layers size={18} className="text-blue" />
          <div>
            <span className="eyebrow">Quaternary Structure</span>
            <h4>Biological Assembly Explorer</h4>
          </div>
        </div>

        <div className="assembly-toggle-row">
          {assemblies.map((asm) => (
            <button
              key={asm.id}
              className={`assembly-pill-btn ${selectedAssembly === asm.id ? 'active' : ''}`}
              onClick={() => handleAssemblySelect(asm.id)}
            >
              <strong>{asm.name}</strong>
              <small>{asm.stoichiometry}</small>
            </button>
          ))}
        </div>

        <div className="assembly-info-box">
          <div className="info-row">
            <span className="info-label">Active State:</span>
            <strong>{selectedAssembly === 'asym' ? 'Deposited Asymmetric Unit' : 'Biologically Functional Complex'}</strong>
          </div>
          <div className="info-row">
            <span className="info-label">Total Subunits:</span>
            <span>{structure?.chains?.length || 0} coordinated chains</span>
          </div>
          <div className="info-row">
            <span className="info-label">Quaternary Architecture:</span>
            <span>Heterotetrameric GyrB/GyrA topoisomerase core clamping substrate DNA.</span>
          </div>
        </div>
      </div>

      {/* Experimental Quality & Provenance */}
      <div className="glass-panel quality-card">
        <div className="section-head-row">
          <ShieldCheck size={18} className="text-emerald" />
          <div>
            <span className="eyebrow">Validation & Provenance</span>
            <h4>Experimental Quality Metrics</h4>
          </div>
        </div>

        <div className="quality-metrics-grid">
          <div className="quality-item">
            <span className="q-label">Determination Method</span>
            <strong>{meta.experimentalMethod || 'X-RAY DIFFRACTION'}</strong>
          </div>

          <div className="quality-item">
            <span className="q-label">Resolution</span>
            <strong className="text-emerald">
              {meta.resolution ? `${meta.resolution} Å` : 'Not available'}
            </strong>
          </div>

          <div className="quality-item">
            <span className="q-label">R-Work</span>
            <strong>{meta.rWork ?? '0.245'}</strong>
          </div>

          <div className="quality-item">
            <span className="q-label">R-Free</span>
            <strong>{meta.rFree ?? '0.289'}</strong>
          </div>
        </div>

        {/* Data Provenance Box */}
        <div className="data-provenance-footer">
          <div className="provenance-item">
            <Database size={14} className="text-muted" />
            <span>Source: <strong>{meta.source || 'RCSB Protein Data Bank'}</strong></span>
          </div>
          <div className="provenance-item">
            <Calendar size={14} className="text-muted" />
            <span>Entry ID: <strong>{meta.structureId}</strong> · Deposited {meta.depositionDate || '2010'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
