import { useState, useMemo } from 'react'
import { Download, Copy, Check, X, FileText, Code } from 'lucide-react'
import {
  generateDrugReportMarkdown,
  downloadFile,
} from '../../services/drugIntelligenceService.js'

export default function DrugReportModal({ drug, onClose }) {
  const [copied, setCopied] = useState(false)
  const [viewType, setViewType] = useState('markdown') // 'markdown' | 'json'

  const markdownReport = useMemo(() => {
    return generateDrugReportMarkdown(drug, drug?.aiSummary)
  }, [drug])

  const jsonReport = useMemo(() => {
    return JSON.stringify(drug, null, 2)
  }, [drug])

  const handleCopy = () => {
    const text = viewType === 'markdown' ? markdownReport : jsonReport
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadMD = () => {
    const filename = `${drug?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'drug'}_dossier.md`
    downloadFile(filename, markdownReport, 'text/markdown')
  }

  const handleDownloadJSON = () => {
    const filename = `${drug?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'drug'}_profile.json`
    downloadFile(filename, jsonReport, 'application/json')
  }

  return (
    <div className="intel-modal-backdrop" onClick={onClose}>
      <div className="intel-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="intel-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
              Export Pharmacological Dossier: {drug?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`view-mode-btn ${viewType === 'markdown' ? 'active' : ''}`}
              onClick={() => setViewType('markdown')}
            >
              <FileText size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Markdown Report
            </button>
            <button
              className={`view-mode-btn ${viewType === 'json' ? 'active' : ''}`}
              onClick={() => setViewType('json')}
            >
              <Code size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Raw JSON
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="action-btn-pill" onClick={handleCopy}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button className="action-btn-pill" onClick={handleDownloadMD}>
              <Download size={14} /> Download .MD
            </button>
            <button className="action-btn-pill primary" onClick={handleDownloadJSON}>
              <Download size={14} /> Download .JSON
            </button>
          </div>
        </div>

        {/* Preview Viewport */}
        <pre
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.78rem',
            color: '#cbd5e1',
            maxHeight: '450px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {viewType === 'markdown' ? markdownReport : jsonReport}
        </pre>
      </div>
    </div>
  )
}
