import { useState, useEffect } from 'react'
import {
  Pill,
  GitCompare,
  Search,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Sparkles,
  Info,
  Sliders,
} from 'lucide-react'
import { getSimilarMolecules } from '../../services/bioStructureService.js'

export default function LigandIntelligencePanel({
  ligands = [],
  activeLigand = null,
  onSelectLigand = () => {},
  onNavigateToComparison = () => {},
  learnMode = false,
  setNotice = () => {},
}) {
  const currentLigand = activeLigand || ligands[0] || null
  const [similarityThreshold, setSimilarityThreshold] = useState(0.65)
  const [similarMolecules, setSimilarMolecules] = useState([])
  const [isSearchingSim, setIsSearchingSim] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    if (currentLigand) {
      handleSearchSimilar(currentLigand.id, similarityThreshold)
    }
  }, [currentLigand, similarityThreshold])

  const handleSearchSimilar = async (ligId, thresh) => {
    setIsSearchingSim(true)
    try {
      const results = await getSimilarMolecules(ligId, thresh)
      setSimilarMolecules(results)
    } catch {
      setSimilarMolecules([])
    } finally {
      setIsSearchingSim(false)
    }
  }

  const handleCopy = (field, val) => {
    if (!val) return
    navigator.clipboard.writeText(val)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1800)
    setNotice(`Copied ${field} to clipboard`)
  }

  if (!currentLigand) {
    return (
      <div className="glass-panel ligand-panel empty-state">
        <Pill size={24} className="text-muted" />
        <p>No bound small-molecule ligands detected in this structure entry.</p>
      </div>
    )
  }

  return (
    <div className="ligand-panel glass-panel">
      {/* Panel Header */}
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Cheminformatics & Drug Chemistry</p>
          <h3>Ligand Intelligence & Chemical Components</h3>
        </div>

        <div className="toolbar-group">
          {/* Bridge to Existing Structure Comparison Feature */}
          <button
            className="primary-button small"
            onClick={() => onNavigateToComparison(currentLigand.name || currentLigand.id)}
            title="Launch Structure Comparison with this ligand"
          >
            <GitCompare size={14} /> Compare Ligand in Studio
          </button>
        </div>
      </div>

      {learnMode && (
        <div className="learn-badge">
          <Info size={13} />
          <span>
            Ligand intelligence profiles the active pharmaceutical component, its chemical
            formula, and its topological similarity to other bioactive drugs.
          </span>
        </div>
      )}

      {/* Ligand Selector Tabs (if multiple ligands) */}
      {ligands.length > 1 && (
        <div className="ligand-tabs-row">
          {ligands.map((l) => (
            <button
              key={l.id}
              className={`ligand-tab-btn ${currentLigand.id === l.id ? 'active' : ''}`}
              onClick={() => onSelectLigand(l.id)}
            >
              <Pill size={14} /> {l.name || l.id} ({l.id})
            </button>
          ))}
        </div>
      )}

      {/* Main Chemical Details Grid */}
      <div className="ligand-details-grid">
        <div className="detail-card name-card">
          <span className="detail-label">Ligand Name</span>
          <strong>{currentLigand.name || currentLigand.id}</strong>
          <small className="code-tag">{currentLigand.id}</small>
        </div>

        <div className="detail-card">
          <span className="detail-label">Chemical Formula</span>
          <strong>{currentLigand.formula || 'C17H18FN3O3'}</strong>
        </div>

        <div className="detail-card">
          <span className="detail-label">Molecular Weight</span>
          <strong>{currentLigand.formulaWeight ? `${currentLigand.formulaWeight} g/mol` : '331.34 g/mol'}</strong>
        </div>

        <div className="detail-card">
          <span className="detail-label">Heavy Atoms</span>
          <strong>{currentLigand.atomCount || 24} atoms</strong>
        </div>

        <div className="detail-card full-width">
          <div className="label-with-copy">
            <span className="detail-label">SMILES Notation</span>
            <button
              className="copy-btn"
              onClick={() => handleCopy('SMILES', currentLigand.smiles || 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O')}
            >
              {copiedField === 'SMILES' ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
            </button>
          </div>
          <code className="code-snippet">
            {currentLigand.smiles || 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O'}
          </code>
        </div>
      </div>

      {/* Chemical Similarity Search Section */}
      <div className="similarity-search-section">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">Structural Analogs</span>
            <h4>Find Similar Bioactive Molecules</h4>
          </div>
          <div className="threshold-control">
            <span className="slider-label">Threshold: {(similarityThreshold * 100).toFixed(0)}%</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(Number.parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Similar Molecules Table */}
        <div className="similar-molecules-table-wrap">
          <table className="similar-table">
            <thead>
              <tr>
                <th>Molecule</th>
                <th>Target & Pharmacological Class</th>
                <th>Formula</th>
                <th>Tanimoto Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {similarMolecules.length ? (
                similarMolecules.map((mol) => (
                  <tr key={mol.id}>
                    <td>
                      <strong>{mol.name}</strong> <small className="code-tag">{mol.id}</small>
                    </td>
                    <td>
                      <span className="tag-neutral">{mol.class}</span>
                    </td>
                    <td>
                      <code>{mol.formula}</code>
                    </td>
                    <td>
                      <div className="score-badge-wrap">
                        <div className="score-bar">
                          <div
                            className="score-fill"
                            style={{ width: `${(mol.similarity * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="score-text">{(mol.similarity * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="quiet-button small"
                        onClick={() => onNavigateToComparison(mol.name)}
                        title="Compare with this analog"
                      >
                        <GitCompare size={12} /> Compare
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-table-cell">
                    No molecules found above the {(similarityThreshold * 100).toFixed(0)}% threshold. Try lowering the slider.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
