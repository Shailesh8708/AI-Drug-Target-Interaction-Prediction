import { useState } from 'react'
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  ShieldCheck,
  Share2,
} from 'lucide-react'
import { formatBioStructureReport } from '../../services/bioStructureService.js'

export default function StructureReportModal({
  structure,
  pocketData,
  similarMolecules = [],
  onClose = () => {},
  setNotice = () => {},
}) {
  const [copied, setCopied] = useState(false)

  const markdownReport = formatBioStructureReport(structure, pocketData, similarMolecules)

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setNotice('Structure analysis report copied to clipboard')
  }

  const handleDownloadMd = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BioStructure_Report_${structure?.metadata?.structureId || 'PDB'}.md`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Markdown report downloaded')
  }

  const handleDownloadJson = () => {
    const reportData = {
      structureId: structure?.metadata?.structureId,
      metadata: structure?.metadata,
      chains: structure?.chains,
      ligands: structure?.ligands,
      pocketData,
      similarMolecules,
      generatedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BioStructure_Data_${structure?.metadata?.structureId || 'PDB'}.json`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('JSON structural data downloaded')
  }

  return (
    <div className="report-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div className="report-modal-card glass-panel">
        <div className="report-modal-header">
          <div className="modal-title-row">
            <FileText size={20} className="text-emerald" />
            <div>
              <h3 id="report-modal-title">BioStructure Intelligence Report</h3>
              <p className="modal-subtitle">
                Publication-ready structural biology & protein–ligand interaction documentation.
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="report-actions-row">
          <button className="tool-button" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
          </button>
          <button className="tool-button" onClick={handleDownloadMd}>
            <Download size={14} /> Download Markdown (.md)
          </button>
          <button className="tool-button" onClick={handleDownloadJson}>
            <Download size={14} /> Export JSON Data (.json)
          </button>
        </div>

        {/* Report Preview */}
        <div className="report-preview-box">
          <pre>{markdownReport}</pre>
        </div>

        <div className="report-modal-footer">
          <ShieldCheck size={14} className="text-muted" />
          <small>
            Aegis computational reports compile experimental crystallographic/cryo-EM coordinates
            and computed contact geometries.
          </small>
        </div>
      </div>
    </div>
  )
}
