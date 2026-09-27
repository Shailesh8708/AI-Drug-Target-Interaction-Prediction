import { useState, useEffect, useRef } from 'react'
import {
  Search,
  BookOpen,
  Sparkles,
  Presentation,
  Dna,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  Atom,
  Flame,
  ArrowRight,
  Database,
} from 'lucide-react'
import { PRESET_STRUCTURES, searchProteins } from '../../services/bioStructureService.js'

function detectQueryCategory(raw) {
  if (!raw || !raw.trim()) return null
  const q = raw.trim()
  if (q.startsWith('>') || (/^[ACDEFGHIKLMNPQRSTVWYU\s\n\r]+$/i.test(q) && q.replace(/[^A-Za-z]/g, '').length >= 12)) {
    return { label: 'FASTA / SEQUENCE', color: 'accent-cyan' }
  }
  if (/^[0-9][A-Za-z0-9]{3}$/i.test(q)) {
    return { label: 'PDB ENTRY', color: 'accent-emerald' }
  }
  if (/^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/i.test(q)) {
    return { label: 'UNIPROT ID', color: 'accent-indigo' }
  }
  if (/^[A-Z0-9]{2,7}$/.test(q) && q === q.toUpperCase() && !/^\d+$/.test(q)) {
    return { label: 'GENE SYMBOL', color: 'accent-orange' }
  }
  const drugMatch = ['ciprofloxacin', 'levofloxacin', 'erlotinib', 'gefitinib', 'saquinavir', 'indinavir', 'aspirin', 'metformin'].includes(q.toLowerCase())
  if (drugMatch) {
    return { label: 'DRUG TARGET', color: 'accent-pink' }
  }
  return { label: 'PROTEIN QUERY', color: 'accent-blue' }
}

export default function StructureSearchHeader({
  currentPdbId = '2XCT',
  currentProtein = null,
  onSearch = () => {},
  isLoading = false,
  presentationMode = false,
  onTogglePresentation = () => {},
  learnMode = false,
  onToggleLearnMode = () => {},
  storyMode = false,
  onToggleStoryMode = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [candidates, setCandidates] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const detectedBadge = detectQueryCategory(searchTerm)

  // Live debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setCandidates([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchProteins(searchTerm)
        setCandidates(results || [])
        setShowDropdown(true)
      } catch {
        setCandidates([])
      } finally {
        setIsSearching(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setShowDropdown(false)
      onSearch(searchTerm.trim())
    }
  }

  const handleSelectCandidate = (candidate) => {
    setShowDropdown(false)
    setSearchTerm(candidate.name)
    onSearch(candidate.pdbId || candidate.id)
  }

  return (
    <div className="structure-search-header-shell" ref={dropdownRef}>
      {/* Title & Description */}
      <div className="header-branding">
        <div className="title-row">
          <div className="icon-badge">
            <Dna size={22} className="text-emerald" />
          </div>
          <div>
            <h1>🧬 BioStructure Intelligence Hub</h1>
            <p className="subtitle">
              Universal structural biology workstation for proteins, macromolecules, binding pockets, and drug complexes.
            </p>
          </div>
        </div>

        {/* Action & Mode Toggles */}
        <div className="mode-toggle-group">
          <button
            className={`mode-pill-btn ${storyMode ? 'active story' : ''}`}
            onClick={onToggleStoryMode}
            title="Step-by-step interactive 3D visual explanation"
          >
            <BookOpen size={14} /> Structure Story
          </button>
          <button
            className={`mode-pill-btn ${learnMode ? 'active learn' : ''}`}
            onClick={onToggleLearnMode}
            title="Educational explanations beside biological components"
          >
            <Sparkles size={14} /> Learn Mode
          </button>
          <button
            className={`mode-pill-btn ${presentationMode ? 'active present' : ''}`}
            onClick={onTogglePresentation}
            title="Clean distraction-free visualization for presentations"
          >
            <Presentation size={14} /> Presentation
          </button>
        </div>
      </div>

      {/* Search Input Bar with Auto-Detection & Autocomplete */}
      {!presentationMode && (
        <div className="search-bar-row">
          <form className="search-form" onSubmit={handleFormSubmit}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (candidates.length) setShowDropdown(true)
              }}
              placeholder="Search by protein (Hemoglobin), gene (TP53), UniProt (P01308), PDB (2XCT), or drug target..."
              aria-label="Universal protein and structural search"
            />

            {/* Auto-detected entity recognition badge */}
            {detectedBadge && (
              <span className={`entity-auto-chip ${detectedBadge.color}`}>
                {detectedBadge.label}
              </span>
            )}

            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => {
                  setSearchTerm('')
                  setCandidates([])
                  setShowDropdown(false)
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

            <button
              type="submit"
              className="primary-button small"
              disabled={isLoading || isSearching}
            >
              {isLoading || isSearching ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Resolving...
                </>
              ) : (
                'Explore Structure'
              )}
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && candidates.length > 0 && (
            <div className="search-candidates-dropdown glass-card">
              <div className="dropdown-header">
                <span>Matching Structures & UniProt Entries ({candidates.length})</span>
                <span className="source-label">wwPDB / UniProtKB</span>
              </div>
              <div className="candidates-list">
                {candidates.map((cand) => (
                  <div
                    key={cand.id + cand.name}
                    className="candidate-row"
                    onClick={() => handleSelectCandidate(cand)}
                  >
                    <div className="candidate-primary">
                      <strong className="cand-name">{cand.name}</strong>
                      <span className="cand-id-badge">
                        {cand.pdbId ? `PDB: ${cand.pdbId}` : `UniProt: ${cand.uniprotId}`}
                      </span>
                    </div>
                    <div className="candidate-secondary">
                      <span className="cand-org">{cand.organism}</span>
                      <span className="cand-method">
                        {cand.method} · {cand.resolution}
                      </span>
                      <span className="cand-provenance">{cand.provenance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Preset Chips */}
          <div className="preset-quick-chips">
            <span className="chips-label">Model Systems:</span>
            {PRESET_STRUCTURES.map((p) => {
              const isActive = currentPdbId.toUpperCase() === p.id.toUpperCase()
              return (
                <button
                  key={p.id}
                  className={`quick-chip ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSearchTerm(p.id)
                    onSearch(p.id)
                  }}
                  title={p.subtitle || p.description}
                >
                  <strong>{p.id}</strong> · {p.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
