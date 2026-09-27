import { useState } from 'react'
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
} from 'lucide-react'
import { PRESET_STRUCTURES } from '../../services/bioStructureService.js'

export default function StructureSearchHeader({
  currentPdbId = '2XCT',
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

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim().toUpperCase())
    }
  }

  return (
    <div className="structure-search-header-shell">
      {/* Title & Description */}
      <div className="header-branding">
        <div className="title-row">
          <div className="icon-badge">
            <Dna size={22} className="text-emerald" />
          </div>
          <div>
            <h1>🧬 BioStructure Intelligence Hub</h1>
            <p className="subtitle">
              Explore proteins, ligands, binding pockets and molecular interactions in an
              intelligent 3D structural workspace.
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

      {/* Search Input Bar */}
      {!presentationMode && (
        <div className="search-bar-row">
          <form className="search-form" onSubmit={handleFormSubmit}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search PDB ID (e.g. 2XCT), protein, gene, UniProt ID, or ligand (Ciprofloxacin)..."
              aria-label="Search structural database"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="primary-button small"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Fetching...
                </>
              ) : (
                'Explore Structure'
              )}
            </button>
          </form>

          {/* Quick Preset Chips */}
          <div className="preset-quick-chips">
            <span className="chips-label">Examples:</span>
            {PRESET_STRUCTURES.map((p) => (
              <button
                key={p.id}
                className={`quick-chip ${currentPdbId.toUpperCase() === p.id ? 'active' : ''}`}
                onClick={() => {
                  setSearchTerm(p.id)
                  onSearch(p.id)
                }}
                title={p.description}
              >
                <strong>{p.id}</strong> · {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
