import { useState } from 'react'
import {
  Layers,
  Dna,
  Atom,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react'

export default function ChainSequenceExplorer({
  chains = [],
  selectedChainId = null,
  selectedResidueId = null,
  onSelectChain = () => {},
  onSelectResidue = () => {},
  learnMode = false,
}) {
  const [activeChainId, setActiveChainId] = useState(selectedChainId || chains[0]?.id || 'B')

  const activeChain = chains.find((c) => c.id === activeChainId) || chains[0]

  const handleChainChange = (chainId) => {
    setActiveChainId(chainId)
    onSelectChain(chainId)
  }

  // Parse sequence characters into clickable items
  const sequenceChars = (activeChain?.sequence || '').split('')

  return (
    <div className="chain-sequence-explorer glass-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Polymer Hierarchy & Sequence Link</p>
          <h3>Chain Explorer & Interactive Sequence Viewer</h3>
        </div>
        {learnMode && (
          <div className="learn-badge">
            <Info size={13} />
            <span>Click any residue in the sequence to automatically center and highlight it in 3D.</span>
          </div>
        )}
      </div>

      {/* Chains Selector Grid */}
      <div className="chains-chip-row">
        {chains.map((chain) => {
          const isSelected = chain.id === activeChainId
          return (
            <button
              key={chain.id}
              className={`chain-chip ${isSelected ? 'active' : ''} ${chain.type}`}
              onClick={() => handleChainChange(chain.id)}
            >
              <span className="chain-letter">{chain.id}</span>
              <div className="chain-chip-meta">
                <strong>{chain.type === 'dna' ? 'DNA' : 'Protein'}</strong>
                <small>{chain.sequence?.length || chain.length || 0} {chain.type === 'dna' ? 'nt' : 'aa'}</small>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Chain Details */}
      {activeChain && (
        <div className="active-chain-summary">
          <div className="summary-item">
            <span className="label">Chain ID:</span>
            <strong>{activeChain.id}</strong>
          </div>
          <div className="summary-item">
            <span className="label">Type:</span>
            <span className={`type-tag ${activeChain.type}`}>
              {activeChain.type.toUpperCase()}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Description:</span>
            <span>{activeChain.description}</span>
          </div>
          <div className="summary-item">
            <span className="label">Length:</span>
            <strong>{activeChain.sequence?.length || activeChain.length || 0} residues</strong>
          </div>
        </div>
      )}

      {/* Interactive Sequence Track */}
      <div className="sequence-track-section">
        <div className="sequence-track-header">
          <span className="track-title">Sequence (5' → 3' / N-term → C-term)</span>
          <span className="track-count">{sequenceChars.length} units</span>
        </div>

        <div className="sequence-scroll-box" tabIndex={0} aria-label="Interactive residue sequence track">
          {sequenceChars.length ? (
            sequenceChars.map((char, index) => {
              const resNum = index + 1
              const resId = `${activeChain.id}:${resNum}`
              const isSelected = selectedResidueId === resId
              return (
                <button
                  key={`${resId}-${index}`}
                  className={`seq-residue-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectResidue(resId)}
                  title={`Residue ${char} #${resNum} (Chain ${activeChain.id})`}
                >
                  <span className="seq-num">{resNum % 10 === 0 ? resNum : ''}</span>
                  <span className="seq-char">{char}</span>
                </button>
              )
            })
          ) : (
            <p className="empty-notice">No sequence data deposited for this chain.</p>
          )}
        </div>
      </div>
    </div>
  )
}
