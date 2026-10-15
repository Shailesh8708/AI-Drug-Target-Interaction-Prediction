import { useState, useMemo } from 'react'
import {
  Layers,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Upload,
  Dna,
  Pill,
  Sparkles,
} from 'lucide-react'

const TAB_LABELS = {
  protein_name: 'Protein Name',
  pdb_id: 'PDB ID',
  uniprot_sequence: 'UniProt / Sequence',
  chemical_name: 'Chemical / Ligand Name',
  iupac_name: 'IUPAC Identifier',
  smiles: 'Chemical SMILES',
  general: 'Universal Search',
}

export default function StructureSearchResultsPanel({
  results = [],
  searchQuery = '',
  searchType = 'general',
  unmatchedMessage = null,
  currentPdbId = '',
  onSelectStructure = () => {},
  onOpenUpload = () => {},
  onClose = () => {},
}) {
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedResolution, setSelectedResolution] = useState('all')
  const [selectedOrganism, setSelectedOrganism] = useState('all')
  const [sortBy, setSortBy] = useState('resolution')

  // Extract unique organisms for dropdown
  const organismOptions = useMemo(() => {
    const orgs = new Set()
    results.forEach((r) => {
      if (r.organism) orgs.add(r.organism)
    })
    return Array.from(orgs)
  }, [results])

  // Filter and sort results
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        if (selectedMethod !== 'all') {
          if (!r.method || !r.method.toLowerCase().includes(selectedMethod.toLowerCase())) {
            return false
          }
        }
        if (selectedResolution !== 'all') {
          const max = Number.parseFloat(selectedResolution)
          if (Number.isFinite(max)) {
            const val = typeof r.resolutionValue === 'number' ? r.resolutionValue : Number.parseFloat(r.resolution)
            if (Number.isFinite(val) && val > max) return false
          }
        }
        if (selectedOrganism !== 'all') {
          if (!r.organism || !r.organism.toLowerCase().includes(selectedOrganism.toLowerCase())) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'resolution') {
          const aRes = a.resolutionValue || Number.parseFloat(a.resolution) || 99
          const bRes = b.resolutionValue || Number.parseFloat(b.resolution) || 99
          return aRes - bRes
        }
        if (sortBy === 'name') {
          return (a.name || a.id).localeCompare(b.name || b.id)
        }
        return 0
      })
  }, [results, selectedMethod, selectedResolution, selectedOrganism, sortBy])

  const tabLabel = TAB_LABELS[searchType] || 'Universal Search'

  return (
    <div className="structure-search-results-panel glass-card">
      {/* Header bar */}
      <div className="results-panel-header">
        <div className="header-meta">
          <div className="search-type-pill">
            <span className="dot" />
            <span>{tabLabel}</span>
          </div>
          <h3>
            Search Results for <span className="query-highlight">"{searchQuery || 'Query'}"</span>
          </h3>
          <span className="count-tag">
            {filteredResults.length} {filteredResults.length === 1 ? 'candidate' : 'candidates'} found
          </span>
        </div>

        <button
          className="quiet-button small icon-only"
          onClick={onClose}
          title="Dismiss search results panel"
          aria-label="Close search results"
        >
          <X size={16} />
        </button>
      </div>

      {/* Filter and sorting toolbar */}
      {results.length > 0 && (
        <div className="results-filter-toolbar">
          <div className="filter-item">
            <span className="filter-label">
              <Filter size={12} /> Method:
            </span>
            <select
              className="select-input compact"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="x-ray">X-Ray Diffraction</option>
              <option value="cryo-em">Cryo-EM</option>
              <option value="nmr">Solution NMR</option>
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Resolution:</span>
            <select
              className="select-input compact"
              value={selectedResolution}
              onChange={(e) => setSelectedResolution(e.target.value)}
            >
              <option value="all">Any Resolution</option>
              <option value="2.0">&le; 2.0 Å (High Precision)</option>
              <option value="2.5">&le; 2.5 Å (Standard)</option>
              <option value="3.5">&le; 3.5 Å (Broad)</option>
            </select>
          </div>

          {organismOptions.length > 1 && (
            <div className="filter-item">
              <span className="filter-label">Organism:</span>
              <select
                className="select-input compact"
                value={selectedOrganism}
                onChange={(e) => setSelectedOrganism(e.target.value)}
              >
                <option value="all">All Organisms</option>
                {organismOptions.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-item right">
            <span className="filter-label">Sort By:</span>
            <select
              className="select-input compact"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="resolution">Best Resolution</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* Unmatched / Clear Scientific Explanation Notice */}
      {unmatchedMessage && (
        <div className="unmatched-explanation-card">
          <div className="explanation-header">
            <AlertCircle size={22} className="text-amber-400" />
            <div>
              <h4>No Exact Macromolecular Complex Identified</h4>
              <p>{unmatchedMessage}</p>
            </div>
          </div>

          <div className="explanation-actions">
            <button
              className="outline-button small"
              onClick={onOpenUpload}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={14} /> Upload Custom Structure File (.pdb, .cif)
            </button>
            <span className="or-text">or explore standard model systems:</span>
            <div className="suggested-chip-group">
              {['2XCT (DNA Gyrase)', '1HSG (HIV Protease)', '1OD2 (ERα)', '1WNL (COX-2)', '7DE4 (SARS Mpro)', '1DS7 (DHFR)'].map((sys) => {
                const id = sys.split(' ')[0]
                return (
                  <button
                    key={id}
                    className="quick-chip small"
                    onClick={() => onSelectStructure(id)}
                  >
                    {sys}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results Cards List */}
      {filteredResults.length > 0 ? (
        <div className="results-cards-grid">
          {filteredResults.map((candidate) => {
            const isLoaded = String(currentPdbId).toUpperCase() === String(candidate.pdbId || candidate.id).toUpperCase()
            return (
              <div
                key={candidate.id + (candidate.pdbId || '')}
                className={`result-structure-card ${isLoaded ? 'currently-loaded' : ''}`}
              >
                <div className="card-top-row">
                  <div className="id-title-box">
                    <span className="pdb-accession-badge">
                      {candidate.pdbId || candidate.id}
                    </span>
                    <h4 className="card-structure-title">{candidate.name || candidate.title}</h4>
                  </div>
                  <span className={`provenance-chip ${candidate.structureType === 'PREDICTED' ? 'predicted' : 'experimental'}`}>
                    {candidate.provenance || '[EXPERIMENTAL STRUCTURE]'}
                  </span>
                </div>

                <div className="card-descriptors-row">
                  <span className="descriptor-pill organism">
                    <strong>Organism:</strong> {candidate.organism || 'N/A'}
                  </span>
                  <span className="descriptor-pill method">
                    <strong>Method:</strong> {candidate.method || 'X-Ray'} ({candidate.resolution})
                  </span>
                  {candidate.chainsCount > 0 && (
                    <span className="descriptor-pill chains">
                      <strong>Chains:</strong> {candidate.chainsCount} ({candidate.chains?.slice(0, 4).join(', ')})
                    </span>
                  )}
                  {candidate.ligands?.length > 0 && (
                    <span className="descriptor-pill ligands">
                      <Pill size={11} /> <strong>Ligand:</strong> {candidate.ligands.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>

                <div className="card-bottom-actions">
                  <span className="source-label">
                    Source: {candidate.source || 'wwPDB / RCSB'}
                  </span>
                  <div className="actions-cluster">
                    {candidate.pdbId && candidate.pdbId.length === 4 && (
                      <a
                        href={`https://www.rcsb.org/structure/${candidate.pdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="quiet-button small external-link-btn"
                        title="View entry on official RCSB Protein Data Bank"
                      >
                        <ExternalLink size={13} /> RCSB PDB
                      </a>
                    )}
                    <button
                      className={`primary-button small ${isLoaded ? 'active-loaded' : ''}`}
                      onClick={() => onSelectStructure(candidate.pdbId || candidate.id, candidate)}
                      disabled={isLoaded}
                    >
                      {isLoaded ? (
                        <>
                          <CheckCircle2 size={13} /> Loaded in 3D View
                        </>
                      ) : (
                        <>
                          <Eye size={13} /> Load in 3D Viewer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        !unmatchedMessage && (
          <div className="empty-results-box">
            <Layers size={28} className="text-slate-500" />
            <p>No macromolecular structures matched the selected filters.</p>
            <button
              className="preset-btn"
              onClick={() => {
                setSelectedMethod('all')
                setSelectedResolution('all')
                setSelectedOrganism('all')
              }}
            >
              Reset Filters
            </button>
          </div>
        )
      )}
    </div>
  )
}

