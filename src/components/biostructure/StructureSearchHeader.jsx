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
  Layers,
  Pill,
  Upload,
  FileText,
  AlertCircle,
} from 'lucide-react'
import {
  PRESET_STRUCTURES,
  searchProteins,
  detectStructureFormat,
  parseUploadedStructureFile,
} from '../../services/bioStructureService.js'

const SEARCH_TABS = [
  { id: 'protein_name', label: 'Protein Name', icon: Dna },
  { id: 'pdb_id', label: 'PDB ID', icon: Layers },
  { id: 'uniprot_sequence', label: 'UniProt / Sequence', icon: Sparkles },
  { id: 'chemical_name', label: 'Chemical Name', icon: Pill },
  { id: 'iupac_name', label: 'IUPAC Name', icon: Atom },
  { id: 'smiles', label: 'SMILES', icon: Flame },
  { id: 'general', label: 'General Search', icon: Search },
  { id: 'upload', label: 'Upload Structure', icon: Upload, badge: 'PDB / mmCIF' },
]

const TAB_CONFIG = {
  protein_name: {
    placeholder: 'Search by macromolecule name (e.g. Hemoglobin, Insulin, DNA Gyrase, p53, COX-2, DHFR, SARS Mpro)...',
    suggestions: [
      { label: 'DNA Gyrase', q: 'DNA Gyrase' },
      { label: 'Deoxyhemoglobin', q: 'Deoxyhemoglobin' },
      { label: 'Insulin', q: 'Insulin' },
      { label: 'p53 Tumor Suppressor', q: 'p53' },
      { label: 'Cyclooxygenase-2', q: 'COX-2' },
      { label: 'DHFR', q: 'DHFR' },
      { label: 'SARS-CoV-2 Mpro', q: 'SARS-CoV-2 Mpro' },
    ],
  },
  pdb_id: {
    placeholder: 'Enter 4-character PDB code (e.g. 2XCT, 1HSG, 1OD2, 1WNL, 7DE4, 4HHB, 4INS, 1DS7, 1BNC)...',
    suggestions: [
      { label: '2XCT', q: '2XCT' },
      { label: '1HSG', q: '1HSG' },
      { label: '1OD2', q: '1OD2' },
      { label: '1WNL', q: '1WNL' },
      { label: '7DE4', q: '7DE4' },
      { label: '4HHB', q: '4HHB' },
      { label: '4INS', q: '4INS' },
      { label: '1DS7', q: '1DS7' },
      { label: '1BNC', q: '1BNC' },
    ],
  },
  uniprot_sequence: {
    placeholder: 'Enter UniProtKB accession (P04637, P01308, P00374, P35354) or raw amino acid sequence...',
    suggestions: [
      { label: 'P0AES4 (GyrA)', q: 'P0AES4' },
      { label: 'P04637 (p53)', q: 'P04637' },
      { label: 'P01308 (Insulin)', q: 'P01308' },
      { label: 'P35354 (PTGS2)', q: 'P35354' },
      { label: 'P00374 (DHFR)', q: 'P00374' },
      { label: 'P0DTD1 (3CLpro)', q: 'P0DTD1' },
    ],
  },
  chemical_name: {
    placeholder: 'Enter drug or ligand name (e.g. Ciprofloxacin, Indinavir, Celecoxib, Tamoxifen, Nirmatrelvir, Methotrexate)...',
    suggestions: [
      { label: 'Ciprofloxacin (2XCT)', q: 'Ciprofloxacin' },
      { label: 'Indinavir (1HSG)', q: 'Indinavir' },
      { label: 'Celecoxib (1WNL)', q: 'Celecoxib' },
      { label: 'Tamoxifen (1OD2)', q: 'Tamoxifen' },
      { label: 'Nirmatrelvir (7DE4)', q: 'Nirmatrelvir' },
      { label: 'Methotrexate (1DS7)', q: 'Methotrexate' },
      { label: 'Aspirin (1WNL)', q: 'Aspirin' },
    ],
  },
  iupac_name: {
    placeholder: 'Enter systematic IUPAC chemical identifier...',
    suggestions: [
      {
        label: 'Ciprofloxacin IUPAC',
        q: '1-cyclopropyl-6-fluoro-4-oxo-7-piperazin-1-ylquinoline-3-carboxylic acid',
      },
      {
        label: 'Celecoxib IUPAC',
        q: '4-[5-(4-methylphenyl)-3-(trifluoromethyl)pyrazol-1-yl]benzenesulfonamide',
      },
      {
        label: 'Tamoxifen Metabolite IUPAC',
        q: '4-[(1Z)-1-[4-[2-(dimethylamino)ethoxy]phenyl]-2-phenylbut-1-en-1-yl]phenol',
      },
    ],
  },
  smiles: {
    placeholder: 'Enter canonical or isomeric chemical SMILES string...',
    suggestions: [
      {
        label: 'Ciprofloxacin SMILES',
        q: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O',
      },
      {
        label: 'Celecoxib SMILES',
        q: 'CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F',
      },
      {
        label: 'Phenol SMILES',
        q: 'C1=CC=C(C=C1)O',
      },
    ],
  },
  general: {
    placeholder: 'Universal structural search across proteins, genes, PDB codes, UniProt, or chemical targets...',
    suggestions: [
      { label: 'DNA Gyrase', q: 'DNA Gyrase' },
      { label: '1HSG', q: '1HSG' },
      { label: 'Ciprofloxacin', q: 'Ciprofloxacin' },
      { label: 'p53', q: 'p53' },
      { label: '7DE4', q: '7DE4' },
      { label: 'Hemoglobin', q: 'Hemoglobin' },
    ],
  },
}

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
  const drugMatch = ['ciprofloxacin', 'indinavir', 'celecoxib', 'tamoxifen', 'nirmatrelvir', 'methotrexate', 'aspirin', 'erlotinib'].includes(q.toLowerCase())
  if (drugMatch) {
    return { label: 'DRUG LIGAND', color: 'accent-pink' }
  }
  return { label: 'STRUCTURAL QUERY', color: 'accent-blue' }
}

export default function StructureSearchHeader({
  currentPdbId = '2XCT',
  currentProtein = null,
  onSearch = () => {},
  onAdvancedSearch = () => {},
  onFileUpload = () => {},
  isLoading = false,
  presentationMode = false,
  onTogglePresentation = () => {},
  learnMode = false,
  onToggleLearnMode = () => {},
  storyMode = false,
  onToggleStoryMode = () => {},
}) {
  const [activeTab, setActiveTab] = useState('general')
  const [searchTerm, setSearchTerm] = useState('')
  const [candidates, setCandidates] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [validationWarning, setValidationWarning] = useState(null)

  // Drag and drop file upload state
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isParsingUpload, setIsParsingUpload] = useState(false)
  const fileInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const detectedBadge = detectQueryCategory(searchTerm)
  const currentTabConfig = TAB_CONFIG[activeTab] || TAB_CONFIG.general

  // Live debounced search for general and protein_name tabs
  useEffect(() => {
    if (activeTab === 'upload') return
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
  }, [searchTerm, activeTab])

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

  // Input validation
  const handleInputChange = (val) => {
    setSearchTerm(val)
    setValidationWarning(null)

    if (activeTab === 'pdb_id' && val.trim().length > 0) {
      if (val.trim().length !== 4 && val.trim().length > 1) {
        setValidationWarning('Standard PDB accession numbers are 4 characters (e.g. 2XCT, 1HSG).')
      }
    } else if (activeTab === 'smiles' && val.trim().length > 0) {
      const validSmilesChar = /^[A-Za-z0-9@+\-\[\]\(\)\\\/=#%.:]+$/
      if (!validSmilesChar.test(val.trim())) {
        setValidationWarning('Invalid character in chemical SMILES string.')
      }
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setShowDropdown(false)
    const clean = searchTerm.trim()

    if (onAdvancedSearch) {
      onAdvancedSearch({ query: clean, searchType: activeTab })
    } else {
      onSearch(clean)
    }
  }

  const handleSelectCandidate = (candidate) => {
    setShowDropdown(false)
    setSearchTerm(candidate.name)
    if (onAdvancedSearch) {
      onAdvancedSearch({ query: candidate.pdbId || candidate.id, searchType: activeTab })
    } else {
      onSearch(candidate.pdbId || candidate.id)
    }
  }

  const handleSuggestionClick = (q) => {
    setSearchTerm(q)
    setShowDropdown(false)
    if (onAdvancedSearch) {
      onAdvancedSearch({ query: q, searchType: activeTab })
    } else {
      onSearch(q)
    }
  }

  // File upload processing
  const handleProcessFile = async (file) => {
    if (!file) return
    setUploadError(null)
    setIsParsingUpload(true)

    // Check size limit: 15 MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds 15 MB limit.`)
      setIsParsingUpload(false)
      return
    }

    try {
      const text = await file.text()
      const format = detectStructureFormat(text, file.name)
      if (format === 'unsupported') {
        setUploadError(`Unsupported file format. Please upload a .pdb, .cif / .mmcif, or .fasta / .fa file.`)
        setIsParsingUpload(false)
        return
      }

      const parsed = parseUploadedStructureFile(text, file.name)
      if (onFileUpload) {
        onFileUpload(parsed, file.name)
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to parse structure file.')
    } finally {
      setIsParsingUpload(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleProcessFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e) => {
    const file = e.target?.files?.[0]
    if (file) handleProcessFile(file)
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

      {/* 7-Mode Dedicated Search Navigation Tabs */}
      {!presentationMode && (
        <div className="search-tab-navigation-strip" role="tablist">
          {SEARCH_TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={`search-nav-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(id)
                setValidationWarning(null)
                setUploadError(null)
                setShowDropdown(false)
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
              {badge && <span className="tab-pill-badge">{badge}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content: Search Input Bar or File Upload Dropzone */}
      {!presentationMode && (
        <div className="search-bar-row">
          {activeTab !== 'upload' ? (
            <>
              <form className="search-form" onSubmit={handleFormSubmit}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => {
                    if (candidates.length) setShowDropdown(true)
                  }}
                  placeholder={currentTabConfig.placeholder}
                  aria-label={currentTabConfig.placeholder}
                />

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
                      setValidationWarning(null)
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
                    'Search & Explore'
                  )}
                </button>
              </form>

              {/* Validation Warning */}
              {validationWarning && (
                <div className="search-validation-banner">
                  <AlertCircle size={14} className="text-amber-400" />
                  <span>{validationWarning}</span>
                </div>
              )}

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

              {/* Contextual Examples & Model Presets */}
              <div className="tab-suggestions-row">
                <span className="chips-label">Examples:</span>
                {currentTabConfig.suggestions.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="quick-chip"
                    onClick={() => handleSuggestionClick(s.q)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Tab H: Structure File Upload System Dropzone */
            <div
              className={`structure-upload-dropzone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdb,.cif,.mmcif,.fa,.fasta,.ent"
                onChange={handleFileInputChange}
              />
              <div className="dropzone-content">
                <Upload size={32} className="text-emerald" />
                <h4>Drag & Drop Macromolecular Structure File</h4>
                <p>
                  Supports <strong>.pdb</strong> (Protein Data Bank), <strong>.cif / .mmcif</strong> (Macromolecular CIF), and <strong>.fa / .fasta</strong> sequence formats (up to 15 MB).
                </p>
                <div className="dropzone-btn-row">
                  <button
                    type="button"
                    className="primary-button small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingUpload}
                  >
                    {isParsingUpload ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Parsing Coordinates...
                      </>
                    ) : (
                      'Browse Local Files'
                    )}
                  </button>
                </div>
                {uploadError && (
                  <div className="dropzone-error-msg">
                    <AlertCircle size={14} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Model Systems Palette */}
          {activeTab !== 'upload' && (
            <div className="preset-quick-chips">
              <span className="chips-label">Reference Models:</span>
              {PRESET_STRUCTURES.slice(0, 10).map((p) => {
                const isActive = currentPdbId.toUpperCase() === p.id.toUpperCase()
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`quick-chip ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSearchTerm(p.id)
                      if (onAdvancedSearch) {
                        onAdvancedSearch({ query: p.id, searchType: 'pdb_id' })
                      } else {
                        onSearch(p.id)
                      }
                    }}
                    title={p.subtitle || p.description}
                  >
                    <strong>{p.id}</strong> · {p.name.split(' ')[0]}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
