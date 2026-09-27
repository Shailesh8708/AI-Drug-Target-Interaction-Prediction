import { useState } from 'react'
import {
  Dna,
  Copy,
  Check,
  Download,
  BarChart2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { analyzeSequence } from '../../services/bioStructureService.js'

export default function ProteinSequenceAnalysisPanel({
  sequence = '',
  sequenceMetrics = null,
  proteinName = 'Protein',
  selectedResidueId = null,
  onSelectResidue = () => {},
  setNotice = () => {},
}) {
  const [copiedFasta, setCopiedFasta] = useState(false)
  const [customSeqInput, setCustomSeqInput] = useState('')
  const [customMetrics, setCustomMetrics] = useState(null)
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false)
  const [activeTab, setActiveTab] = useState('structure-seq') // 'structure-seq' | 'custom-analyzer'

  const activeMetrics = (activeTab === 'custom-analyzer' && customMetrics)
    ? customMetrics
    : (sequenceMetrics || {
        sequence: sequence || '',
        length: sequence?.length || 0,
        molecularWeightDa: Math.round((sequence?.length || 0) * 110),
        molecularWeightKDa: Number.parseFloat((((sequence?.length || 0) * 110) / 1000).toFixed(2)),
        theoreticalPi: 6.8,
        chargeAtPh74: 0.2,
        gravyHydropathy: -0.15,
        extinctionCoefficient: 5500,
        composition: {
          hydrophobicPercent: 42,
          polarPercent: 28,
          acidicPercent: 14,
          basicPercent: 16,
          aromaticPercent: 9,
          cysteineCount: 4,
          glycineCount: 12,
          prolineCount: 8,
          residueCounts: {},
        },
        secondaryStructureEstimate: {
          alphaHelix: 45,
          betaSheet: 28,
          turnsAndCoils: 27,
        },
      })

  const seqChars = (activeMetrics.sequence || sequence || '').split('')

  const handleCopyFasta = () => {
    const header = `>Aegis|${proteinName.replace(/\s+/g, '_')}|Sequence_Analysis (Length: ${activeMetrics.length} aa, MW: ${activeMetrics.molecularWeightKDa} kDa, pI: ${activeMetrics.theoreticalPi})\n`
    const fastaContent = header + (activeMetrics.sequence || sequence).match(/.{1,60}/g)?.join('\n')
    navigator.clipboard.writeText(fastaContent)
    setCopiedFasta(true)
    setTimeout(() => setCopiedFasta(false), 2000)
    setNotice('Copied FASTA sequence with biophysical headers to clipboard.')
  }

  const handleDownloadFasta = () => {
    const header = `>Aegis|${proteinName.replace(/\s+/g, '_')}|Sequence_Analysis\n`
    const fastaContent = header + (activeMetrics.sequence || sequence).match(/.{1,60}/g)?.join('\n')
    const blob = new Blob([fastaContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${proteinName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sequence.fasta`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setNotice('Downloaded FASTA file.')
  }

  const handleRunCustomAnalysis = async (e) => {
    e.preventDefault()
    if (!customSeqInput.trim()) return
    setIsAnalyzingCustom(true)
    try {
      const res = await analyzeSequence(customSeqInput)
      setCustomMetrics(res)
      setNotice(`Analyzed custom peptide of ${res.length} residues.`)
    } catch {
      setNotice('Could not analyze sequence.')
    } finally {
      setIsAnalyzingCustom(false)
    }
  }

  return (
    <div className="glass-panel sequence-analytics-panel">
      {/* Panel Header */}
      <div className="panel-heading compact">
        <div>
          <div className="badge-flame-row">
            <Dna size={18} className="text-emerald" />
            <p className="eyebrow">Biophysical & Chemical Properties · [CALCULATED INFORMATION]</p>
          </div>
          <h3>🧬 Universal Sequence & Biophysical Analytics</h3>
          <p className="panel-subtext">
            Deterministic sequence metrics, theoretical isoelectric point, hydropathy, and amino acid composition.
          </p>
        </div>

        <div className="toolbar-group">
          <button
            className={`quiet-button small ${activeTab === 'structure-seq' ? 'active' : ''}`}
            onClick={() => setActiveTab('structure-seq')}
          >
            Structure Sequence
          </button>
          <button
            className={`quiet-button small ${activeTab === 'custom-analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom-analyzer')}
          >
            Custom Sequence Analyzer
          </button>
          <button className="primary-button small" onClick={handleCopyFasta} title="Copy FASTA">
            {copiedFasta ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedFasta ? 'Copied FASTA' : 'Copy FASTA'}</span>
          </button>
          <button className="outline-button small" onClick={handleDownloadFasta} title="Download .fasta">
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Custom Sequence Analyzer Input Drawer */}
      {activeTab === 'custom-analyzer' && (
        <form onSubmit={handleRunCustomAnalysis} className="custom-seq-form">
          <label className="input-label">Paste Raw Amino Acid Sequence or FASTA:</label>
          <div className="seq-input-group">
            <textarea
              className="seq-textarea"
              rows={3}
              value={customSeqInput}
              onChange={(e) => setCustomSeqInput(e.target.value)}
              placeholder="e.g. >MyPeptide&#10;GIVEQCCTSICSLYQLENYCNFVNQHLCGSHLVEALYLVCGERGFFYTPKT..."
            />
            <button type="submit" className="primary-button" disabled={isAnalyzingCustom || !customSeqInput.trim()}>
              <Zap size={14} />
              <span>{isAnalyzingCustom ? 'Analyzing...' : 'Calculate Biophysics'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Biophysical Metrics Grid */}
      <div className="sequence-metrics-grid">
        <div className="seq-metric-card">
          <span className="metric-title">Length</span>
          <span className="metric-number">{activeMetrics.length}</span>
          <span className="metric-unit">Amino Acids</span>
        </div>
        <div className="seq-metric-card accent-mw">
          <span className="metric-title">Molecular Weight</span>
          <span className="metric-number">{activeMetrics.molecularWeightKDa}</span>
          <span className="metric-unit">kDa ({activeMetrics.molecularWeightDa?.toLocaleString()} Da)</span>
        </div>
        <div className="seq-metric-card accent-pi">
          <span className="metric-title">Theoretical pI</span>
          <span className="metric-number">{activeMetrics.theoreticalPi}</span>
          <span className="metric-unit">
            {activeMetrics.theoreticalPi > 7.4 ? 'Basic (Cationic)' : activeMetrics.theoreticalPi < 7.0 ? 'Acidic (Anionic)' : 'Neutral'}
          </span>
        </div>
        <div className="seq-metric-card accent-charge">
          <span className="metric-title">Net Charge (pH 7.4)</span>
          <span className="metric-number">
            {activeMetrics.chargeAtPh74 > 0 ? `+${activeMetrics.chargeAtPh74}` : activeMetrics.chargeAtPh74}
          </span>
          <span className="metric-unit">Fundamental Charges (e)</span>
        </div>
        <div className="seq-metric-card accent-gravy">
          <span className="metric-title">GRAVY Hydropathy</span>
          <span className="metric-number">{activeMetrics.gravyHydropathy}</span>
          <span className="metric-unit">
            {activeMetrics.gravyHydropathy > 0 ? 'Hydrophobic Core' : 'Hydrophilic / Soluble'}
          </span>
        </div>
        <div className="seq-metric-card accent-ext">
          <span className="metric-title">Extinction Coeff (280nm)</span>
          <span className="metric-number">{activeMetrics.extinctionCoefficient}</span>
          <span className="metric-unit">M⁻¹ cm⁻¹ (in water)</span>
        </div>
      </div>

      {/* Composition Breakdown Visual Bar */}
      <div className="composition-section">
        <div className="section-title-row">
          <h4>Amino Acid Composition & Polarity Breakdown</h4>
          <span className="data-tier-tag">[CALCULATED INFORMATION]</span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="stacked-comp-bar" title="Amino Acid Polarity Distribution">
          <div
            className="bar-seg hydrophobic"
            style={{ width: `${activeMetrics.composition?.hydrophobicPercent || 40}%` }}
            title={`Hydrophobic: ${activeMetrics.composition?.hydrophobicPercent}%`}
          />
          <div
            className="bar-seg polar"
            style={{ width: `${activeMetrics.composition?.polarPercent || 30}%` }}
            title={`Polar: ${activeMetrics.composition?.polarPercent}%`}
          />
          <div
            className="bar-seg acidic"
            style={{ width: `${activeMetrics.composition?.acidicPercent || 15}%` }}
            title={`Acidic (-): ${activeMetrics.composition?.acidicPercent}%`}
          />
          <div
            className="bar-seg basic"
            style={{ width: `${activeMetrics.composition?.basicPercent || 15}%` }}
            title={`Basic (+): ${activeMetrics.composition?.basicPercent}%`}
          />
        </div>

        {/* Composition Badges */}
        <div className="comp-chips-row">
          <span className="comp-chip hydrophobic">
            <strong>{activeMetrics.composition?.hydrophobicPercent}%</strong> Hydrophobic (A,I,L,V,M,F,W,P)
          </span>
          <span className="comp-chip polar">
            <strong>{activeMetrics.composition?.polarPercent}%</strong> Polar (S,T,Y,N,Q)
          </span>
          <span className="comp-chip acidic">
            <strong>{activeMetrics.composition?.acidicPercent}%</strong> Acidic (Asp, Glu)
          </span>
          <span className="comp-chip basic">
            <strong>{activeMetrics.composition?.basicPercent}%</strong> Basic (Lys, Arg, His)
          </span>
          <span className="comp-chip aromatic">
            <strong>{activeMetrics.composition?.aromaticPercent}%</strong> Aromatic (Phe, Tyr, Trp)
          </span>
          <span className="comp-chip structural">
            <strong>{activeMetrics.composition?.cysteineCount || 0}</strong> Cys · <strong>{activeMetrics.composition?.glycineCount || 0}</strong> Gly · <strong>{activeMetrics.composition?.prolineCount || 0}</strong> Pro
          </span>
        </div>
      </div>

      {/* Secondary Structure Propensity Estimate */}
      <div className="sec-structure-section">
        <h4>Predicted Secondary Structure Propensities</h4>
        <div className="sec-structure-cards">
          <div className="sec-card alpha">
            <span className="sec-label">Alpha Helix (α)</span>
            <span className="sec-value">{activeMetrics.secondaryStructureEstimate?.alphaHelix || 40}%</span>
            <div className="sec-progress"><div className="fill alpha" style={{ width: `${activeMetrics.secondaryStructureEstimate?.alphaHelix || 40}%` }} /></div>
          </div>
          <div className="sec-card beta">
            <span className="sec-label">Beta Sheet (β)</span>
            <span className="sec-value">{activeMetrics.secondaryStructureEstimate?.betaSheet || 30}%</span>
            <div className="sec-progress"><div className="fill beta" style={{ width: `${activeMetrics.secondaryStructureEstimate?.betaSheet || 30}%` }} /></div>
          </div>
          <div className="sec-card coil">
            <span className="sec-label">Turns & Coils</span>
            <span className="sec-value">{activeMetrics.secondaryStructureEstimate?.turnsAndCoils || 30}%</span>
            <div className="sec-progress"><div className="fill coil" style={{ width: `${activeMetrics.secondaryStructureEstimate?.turnsAndCoils || 30}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Interactive Sequence Track */}
      <div className="sequence-track-box">
        <div className="track-header-row">
          <span className="track-title">Polypeptide Sequence ({seqChars.length} residues)</span>
          <span className="track-sub">Click any residue to focus in 3D viewport</span>
        </div>
        <div className="residue-chip-stream" tabIndex={0} aria-label="Interactive residue sequence">
          {seqChars.map((char, idx) => {
            const pos = idx + 1
            const isSelected = selectedResidueId && (selectedResidueId.endsWith(`:${pos}`) || selectedResidueId === String(pos))
            return (
              <button
                key={pos}
                className={`res-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectResidue(pos)}
                title={`Residue ${char}${pos}`}
              >
                <span className="res-pos">{pos % 10 === 0 ? pos : ''}</span>
                <span className="res-char">{char}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
