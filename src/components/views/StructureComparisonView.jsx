import { useEffect, useState, useRef } from 'react'
import {
  ArrowLeftRight,
  Download,
  Copy,
  Check,
  Search,
  Share2,
  Atom,
  Box,
  Layers,
  FlaskConical,
  Wand2,
  Eye,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react'
import { autocompleteCompoundQuery } from '../../services/api.js'
import {
  runStructureComparison,
  PRESET_COMPARISON_PAIRS,
  formatComparisonReport,
} from '../../services/structureComparisonService.js'

import SideBySide2DViewer from '../comparison/SideBySide2DViewer.jsx'
import Interactive3DComparison from '../comparison/Interactive3DComparison.jsx'
import PropertyComparisonTable from '../comparison/PropertyComparisonTable.jsx'
import StructuralRelationshipPanel from '../comparison/StructuralRelationshipPanel.jsx'
import '../comparison/comparison.css'

export default function StructureComparisonView({ setNotice, navigate }) {
  const [queryA, setQueryA] = useState('Benzene')
  const [queryB, setQueryB] = useState('Toluene')
  const [activePreset, setActivePreset] = useState('benzene-toluene')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)

  const [activeTab, setActiveTab] = useState('2d') // '2d' | '3d' | 'properties' | 'mcs' | 'report'
  const [copiedReport, setCopiedReport] = useState(false)

  // Autocomplete state
  const [suggestionsA, setSuggestionsA] = useState([])
  const [suggestionsB, setSuggestionsB] = useState([])
  const [showAutoA, setShowAutoA] = useState(false)
  const [showAutoB, setShowAutoB] = useState(false)

  // Load initial comparison on mount
  useEffect(() => {
    executeComparison('Benzene', 'Toluene')
  }, [])

  // Execute Comparison
  const executeComparison = async (termA, termB) => {
    const qA = (termA || queryA).trim()
    const qB = (termB || queryB).trim()

    if (!qA || !qB) {
      setErrorMessage('Please provide both Compound A and Compound B to compare.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await runStructureComparison(qA, qB)
      setComparisonData(data)
      if (setNotice) {
        setNotice(`Compared ${data.compoundA.name || qA} with ${data.compoundB.name || qB}`)
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to complete comparison. Please verify compound names or SMILES.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Preset Selection
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id)
    setQueryA(preset.nameA)
    setQueryB(preset.nameB)
    executeComparison(preset.nameA, preset.nameB)
  }

  // Handle Swap
  const handleSwap = () => {
    const tempA = queryA
    const tempB = queryB
    setQueryA(tempB)
    setQueryB(tempA)
    setActivePreset(null)
    executeComparison(tempB, tempA)
  }

  // Handle Autocomplete A
  const handleQueryAChange = async (val) => {
    setQueryA(val)
    setActivePreset(null)
    if (val.trim().length > 1) {
      try {
        const res = await autocompleteCompoundQuery(val)
        setSuggestionsA(res.terms || [])
        setShowAutoA(true)
      } catch {
        setSuggestionsA([])
      }
    } else {
      setShowAutoA(false)
    }
  }

  // Handle Autocomplete B
  const handleQueryBChange = async (val) => {
    setQueryB(val)
    setActivePreset(null)
    if (val.trim().length > 1) {
      try {
        const res = await autocompleteCompoundQuery(val)
        setSuggestionsB(res.terms || [])
        setShowAutoB(true)
      } catch {
        setSuggestionsB([])
      }
    } else {
      setShowAutoB(false)
    }
  }

  // Copy Markdown Report to Clipboard
  const handleCopyReport = () => {
    if (!comparisonData) return
    const text = formatComparisonReport(comparisonData)
    navigator.clipboard.writeText(text)
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 2000)
    if (setNotice) setNotice('Comparison report copied to clipboard')
  }

  // Download Markdown Report
  const handleDownloadReport = () => {
    if (!comparisonData) return
    const text = formatComparisonReport(comparisonData)
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Comparison_${comparisonData.compoundA.name || 'A'}_vs_${comparisonData.compoundB.name || 'B'}.md`
    link.click()
    URL.revokeObjectURL(url)
    if (setNotice) setNotice('Comparison report file downloaded')
  }

  // Download JSON raw data
  const handleDownloadJSON = () => {
    if (!comparisonData) return
    const blob = new Blob([JSON.stringify(comparisonData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Comparison_${comparisonData.compoundA.name || 'A'}_vs_${comparisonData.compoundB.name || 'B'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-wrap comparison-view-shell">
      {/* Intro Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Computational Cheminformatics</p>
          <h1>Molecular Structure Comparison</h1>
          <p className="intro-copy">
            Analyze two chemical compounds side-by-side. Calculate Maximum Common Substructure
            (MCS), circular topological fingerprint similarity (Tanimoto), and physicochemical
            property differences.
          </p>
        </div>

        <button
          className="primary-button small"
          onClick={() => executeComparison(queryA, queryB)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw size={15} className="animate-spin" /> Comparing...
            </>
          ) : (
            <>
              <Sparkles size={15} /> Compare Structures
            </>
          )}
        </button>
      </div>

      {/* Preset Quick Pairs */}
      <section className="preset-pairs-section">
        <p className="eyebrow">Quick demonstration pairs</p>
        <div className="preset-pills-row">
          {PRESET_COMPARISON_PAIRS.map((preset) => (
            <button
              key={preset.id}
              className={`preset-pill-btn ${activePreset === preset.id ? 'active' : ''}`}
              onClick={() => handleSelectPreset(preset)}
              title={preset.description}
            >
              <span>{preset.nameA} vs {preset.nameB}</span>
              <span className="preset-tag">{preset.category}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dual Input Card */}
      <section className="compound-input-dual-card">
        {/* Molecule A Input */}
        <div className="compound-input-col">
          <div className="input-col-header">
            <span className="mol-indicator a">Compound A</span>
            <small className="field-help">Name, SMILES, Formula, CID</small>
          </div>
          <div className="input-with-search">
            <Search size={15} className="input-search-icon" />
            <input
              value={queryA}
              onChange={(e) => handleQueryAChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowAutoA(false)
                  executeComparison(queryA, queryB)
                }
              }}
              placeholder="e.g. Benzene, C6H6, c1ccccc1"
              aria-label="Compound A query"
            />
            {queryA && (
              <button className="clear-input-btn" onClick={() => setQueryA('')} title="Clear">
                <X size={14} />
              </button>
            )}

            {/* Autocomplete dropdown A */}
            {showAutoA && suggestionsA.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestionsA.map((term) => (
                  <div
                    key={term}
                    className="autocomplete-item"
                    onClick={() => {
                      setQueryA(term)
                      setShowAutoA(false)
                      executeComparison(term, queryB)
                    }}
                  >
                    {term}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button Column */}
        <div className="swap-col">
          <button className="swap-button" onClick={handleSwap} title="Swap Compound A and B">
            <ArrowLeftRight size={17} />
          </button>
        </div>

        {/* Molecule B Input */}
        <div className="compound-input-col">
          <div className="input-col-header">
            <span className="mol-indicator b">Compound B</span>
            <small className="field-help">Name, SMILES, Formula, CID</small>
          </div>
          <div className="input-with-search">
            <Search size={15} className="input-search-icon" />
            <input
              value={queryB}
              onChange={(e) => handleQueryBChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowAutoB(false)
                  executeComparison(queryA, queryB)
                }
              }}
              placeholder="e.g. Toluene, C7H8, Cc1ccccc1"
              aria-label="Compound B query"
            />
            {queryB && (
              <button className="clear-input-btn" onClick={() => setQueryB('')} title="Clear">
                <X size={14} />
              </button>
            )}

            {/* Autocomplete dropdown B */}
            {showAutoB && suggestionsB.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestionsB.map((term) => (
                  <div
                    key={term}
                    className="autocomplete-item"
                    onClick={() => {
                      setQueryB(term)
                      setShowAutoB(false)
                      executeComparison(queryA, term)
                    }}
                  >
                    {term}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {errorMessage && (
        <div className="toast danger" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      {comparisonData && (
        <nav className="view-tabs-bar" aria-label="Comparison modes">
          <button
            className={`view-tab-btn ${activeTab === '2d' ? 'active' : ''}`}
            onClick={() => setActiveTab('2d')}
          >
            <Atom size={15} /> 2D Structural Alignment
          </button>
          <button
            className={`view-tab-btn ${activeTab === '3d' ? 'active' : ''}`}
            onClick={() => setActiveTab('3d')}
          >
            <Box size={15} /> Interactive 3D Comparison
          </button>
          <button
            className={`view-tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            <FileText size={15} /> Property Shifts (Δ)
          </button>
          <button
            className={`view-tab-btn ${activeTab === 'mcs' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcs')}
          >
            <Layers size={15} /> MCS & Fingerprint Similarity
          </button>
          <button
            className={`view-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <Share2 size={15} /> Export & Lab Integration
          </button>
        </nav>
      )}

      {/* Main Tab Content */}
      {comparisonData && (
        <section className="comparison-content-view">
          {activeTab === '2d' && (
            <SideBySide2DViewer
              compoundA={comparisonData.compoundA}
              compoundB={comparisonData.compoundB}
              mcs={comparisonData.mcs}
              differences={comparisonData.differences}
            />
          )}

          {activeTab === '3d' && (
            <Interactive3DComparison
              compoundA={comparisonData.compoundA}
              compoundB={comparisonData.compoundB}
              mcs={comparisonData.mcs}
            />
          )}

          {activeTab === 'properties' && (
            <PropertyComparisonTable
              compoundA={comparisonData.compoundA}
              compoundB={comparisonData.compoundB}
              differences={comparisonData.differences}
            />
          )}

          {activeTab === 'mcs' && (
            <StructuralRelationshipPanel
              compoundA={comparisonData.compoundA}
              compoundB={comparisonData.compoundB}
              mcs={comparisonData.mcs}
              similarity={comparisonData.similarity}
              differences={comparisonData.differences}
            />
          )}

          {activeTab === 'report' && (
            <div className="glass-panel export-report-panel">
              <div className="panel-heading compact">
                <div>
                  <p className="eyebrow">Documentation & Interoperability</p>
                  <h3>Cheminformatics Comparison Report</h3>
                </div>

                <div className="icon-actions">
                  <button
                    className="tool-button"
                    onClick={handleCopyReport}
                    title="Copy Markdown Report to clipboard"
                  >
                    {copiedReport ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    {copiedReport ? 'Copied!' : 'Copy Markdown'}
                  </button>
                  <button
                    className="tool-button"
                    onClick={handleDownloadReport}
                    title="Download Markdown summary"
                  >
                    <Download size={14} /> Download .md
                  </button>
                  <button
                    className="tool-button"
                    onClick={handleDownloadJSON}
                    title="Download JSON structured data"
                  >
                    <Download size={14} /> JSON Data
                  </button>
                </div>
              </div>

              {/* Lab Workflow Integration buttons */}
              <div className="report-actions-bar">
                <div className="actions-info">
                  <strong>Send molecules to other Aegis modules:</strong>
                  <span className="field-help">Use these compounds directly in DTI modeling or 3D visualization.</span>
                </div>
                <div className="toolbar-group">
                  <button
                    className="primary-button small"
                    onClick={() => {
                      if (navigate) navigate('visualize')
                      if (setNotice) setNotice(`Viewing ${comparisonData.compoundA.name || 'Compound A'} in 3D Visualizer`)
                    }}
                  >
                    <Eye size={14} /> Visualize Molecule A
                  </button>
                  <button
                    className="primary-button small"
                    onClick={() => {
                      if (navigate) navigate('visualize')
                      if (setNotice) setNotice(`Viewing ${comparisonData.compoundB.name || 'Compound B'} in 3D Visualizer`)
                    }}
                  >
                    <Eye size={14} /> Visualize Molecule B
                  </button>
                  <button
                    className="primary-button small"
                    onClick={() => {
                      if (navigate) navigate('dti')
                      if (setNotice) setNotice('Opening DTI Lab with selected compounds')
                    }}
                  >
                    <FlaskConical size={14} /> Compose DTI Study
                  </button>
                </div>
              </div>

              {/* Raw Preview of Markdown Report */}
              <pre className="report-copy-pre">
                {formatComparisonReport(comparisonData)}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* Safety & Non-Diagnostic Disclaimer */}
      <div className="disclaimer">
        <ShieldCheck size={18} />
        <p>
          <strong>Research and educational cheminformatics tool.</strong> Aegis does not diagnose,
          prescribe, or confirm biological efficacy. Molecular similarity (Tanimoto, MCS) reflects
          topological arrangement in silico and must not be interpreted as equivalent clinical or
          therapeutic action. Always verify results with empirical laboratory assays.
        </p>
      </div>
    </div>
  )
}
