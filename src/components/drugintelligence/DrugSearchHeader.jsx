import { useState, useEffect } from 'react'
import { Search, Sparkles, BookOpen, Download, Bookmark, Pill, RefreshCw, Atom, Dna, FlaskConical } from 'lucide-react'
import { FLAGSHIP_DRUGS, searchDrugs } from '../../services/drugIntelligenceService.js'

export default function DrugSearchHeader({
  activeDrugId,
  onSelectDrug,
  onOpenWorkspace,
  onOpenReport,
  onOpenJourney,
  loading,
}) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      setDropdownOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchDrugs(query)
      setSearchResults(results)
      setIsSearching(false)
      setDropdownOpen(true)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (drugId) => {
    setDropdownOpen(false)
    setQuery('')
    onSelectDrug(drugId)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults.length > 0) {
        handleSelect(searchResults[0].id || searchResults[0].name)
      } else if (query.trim()) {
        handleSelect(query.trim())
      }
    }
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'ELEMENT':
        return <Atom size={14} color="#10b981" />
      case 'PROTEIN':
      case 'PROTEIN-LIGAND COMPLEX':
        return <Dna size={14} color="#38bdf8" />
      default:
        return <FlaskConical size={14} color="#f59e0b" />
    }
  }

  return (
    <div className="drug-search-shell">
      <div className="drug-header-brand">
        <div className="brand-title-group">
          <div className="brand-icon-box">
            <Pill size={24} />
          </div>
          <div>
            <h1>
              Universal Drug & Chemical Intelligence
              <span className="sub-badge">v3.0 Dynamic</span>
            </h1>
            <p className="header-subtitle">
              Dynamic analysis of all 118 periodic elements, organic & inorganic compounds, drug molecules, biomolecules, and macromolecular protein complexes.
            </p>
          </div>
        </div>

        <div className="header-actions-right">
          <button className="action-btn-pill" onClick={onOpenWorkspace} title="View Bookmarks & Notes">
            <Bookmark size={15} /> Workspace
          </button>
          <button className="action-btn-pill" onClick={onOpenReport} title="Export Research Dossier">
            <Download size={15} /> Export Dossier
          </button>
          <button className="action-btn-pill primary" onClick={onOpenJourney} title="Storytelling Journey">
            <BookOpen size={15} /> Journey
          </button>
        </div>
      </div>

      {/* Universal Search Input */}
      <div className="search-bar-row">
        <div className="search-input-container">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search any element, compound, drug, protein, PDB ID (e.g. Iron, Benzene, Aspirin, Insulin, 2XCT, CCO)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setDropdownOpen(true)}
          />
          {isSearching && <RefreshCw size={16} className="spin" color="#10b981" />}
        </div>

        {dropdownOpen && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((res, idx) => (
              <div
                key={res.id || idx}
                className="search-result-item"
                onClick={() => handleSelect(res.id || res.name)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getEntityIcon(res.entityType)}
                  <div>
                    <strong style={{ color: '#f1f5f9' }}>{res.name}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {res.categoryLabel || res.drugClass || res.formula || 'Chemical Record'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      background: 'rgba(51, 65, 85, 0.4)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#38bdf8',
                    }}
                  >
                    {res.source || 'Curated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flagship Fast-Pills */}
      <div className="flagship-pills-row">
        <span className="flagship-label">Flagship Explorations:</span>
        {FLAGSHIP_DRUGS.map((f) => (
          <button
            key={f.id}
            className={`flagship-pill ${activeDrugId === f.id ? 'active' : ''}`}
            onClick={() => handleSelect(f.id)}
            disabled={loading}
            title={`${f.name} · ${f.categoryLabel || f.class}`}
          >
            {f.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}
