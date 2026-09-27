import { useState, useEffect } from 'react'
import { Search, Sparkles, BookOpen, Download, Bookmark, Pill, RefreshCw } from 'lucide-react'
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
    }, 280)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (drugId) => {
    setDropdownOpen(false)
    setQuery('')
    onSelectDrug(drugId)
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
              Drug Intelligence & Analysis
              <span className="sub-badge">v2.5 Lab</span>
            </h1>
            <p className="header-subtitle">
              Explore drug structures, pharmacology, targets, bioactivity, ADME, interactions and AI-powered drug–target intelligence.
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
          <button className="action-btn-pill primary" onClick={onOpenJourney} title="10-Step Storytelling Journey">
            <BookOpen size={15} /> Drug Journey
          </button>
        </div>
      </div>

      {/* Universal Search Input */}
      <div className="search-bar-row">
        <div className="search-input-container">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by drug name, brand, SMILES, InChIKey, PubChem CID, ChEMBL ID, or target..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setDropdownOpen(true)}
          />
          {isSearching && <RefreshCw size={16} className="spin" color="#10b981" />}
        </div>

        {dropdownOpen && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((res) => (
              <div
                key={res.id || res.cid}
                className="search-result-item"
                onClick={() => handleSelect(res.id || res.name)}
              >
                <div>
                  <strong>{res.name}</strong>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {res.class || res.formula || 'Compound Record'}
                  </div>
                </div>
                <small>{res.matchType || (res.cid ? `CID: ${res.cid}` : 'Curated')}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flagship Fast-Pills */}
      <div className="flagship-pills-row">
        <span className="flagship-label">Flagship Reference Library:</span>
        {FLAGSHIP_DRUGS.map((f) => (
          <button
            key={f.id}
            className={`flagship-pill ${activeDrugId === f.id ? 'active' : ''}`}
            onClick={() => handleSelect(f.id)}
            disabled={loading}
          >
            {f.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}
