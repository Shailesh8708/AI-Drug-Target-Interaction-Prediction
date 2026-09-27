import { useState } from 'react'
import { Bookmark, Copy, Check, ExternalLink, Dna, GitCompare, FlaskConical, Atom } from 'lucide-react'
import { isFavorite, toggleFavorite } from '../../services/drugIntelligenceService.js'

export default function DrugProfileHeader({ drug, onFavoriteChange, navigate, onVisualize2D3D }) {
  const [copiedKey, setCopiedKey] = useState(null)
  const isFav = isFavorite(drug?.id)

  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleToggleFav = () => {
    toggleFavorite(drug)
    if (onFavoriteChange) onFavoriteChange()
  }

  if (!drug) return null

  return (
    <div className="drug-profile-banner">
      <div className="banner-glow-orb" />

      <div className="profile-main-row">
        <div className="drug-name-classification">
          <div className="drug-primary-name">
            {drug.name}
            <span className="approval-badge">{drug.approvalStatus || 'FDA Approved'}</span>
          </div>
          <div className="drug-class-tag">{drug.class || 'Therapeutic Agent'}</div>
          {drug.brandNames?.length > 0 && (
            <div className="synonyms-row">
              <strong>Brands:</strong> <span>{drug.brandNames.join(', ')}</span>
            </div>
          )}
          {drug.synonyms?.length > 0 && (
            <div className="synonyms-row">
              <strong>Synonyms:</strong> <span>{drug.synonyms.slice(0, 5).join(' · ')}</span>
            </div>
          )}
        </div>

        <div className="banner-action-buttons">
          <button
            className={`action-btn-pill ${isFav ? 'primary' : ''}`}
            onClick={handleToggleFav}
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Bookmark size={15} fill={isFav ? 'currentColor' : 'none'} />
            {isFav ? 'Bookmarked' : 'Bookmark'}
          </button>

          {navigate && (
            <>
              <button
                className="action-btn-pill"
                onClick={() => navigate('compare')}
                title="Send compound to Structure Comparison"
              >
                <GitCompare size={15} /> Compare
              </button>
              <button
                className="action-btn-pill"
                onClick={() => navigate('biostructure')}
                title="Open 3D BioStructure Intelligence Hub"
              >
                <Dna size={15} /> BioStructure
              </button>
              <button
                className="action-btn-pill"
                onClick={() => navigate('dti')}
                title="Predict DTI affinities in DTI Lab"
              >
                <FlaskConical size={15} /> DTI Lab
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chemical Identity Grid */}
      <div className="identity-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Chemical Formula</span>
          <span className="meta-val">{drug.formula || 'N/A'}</span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Molecular Weight</span>
          <span className="meta-val">{drug.mw ? `${drug.mw.toFixed(2)} g/mol` : 'N/A'}</span>
        </div>

        <div className="meta-item">
          <span className="meta-label">PubChem CID</span>
          <span className="meta-val">
            {drug.pubchemCid ? (
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${drug.pubchemCid}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none' }}
              >
                {drug.pubchemCid} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
              </a>
            ) : (
              'N/A'
            )}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">ChEMBL ID</span>
          <span className="meta-val">
            {drug.chemblId ? (
              <a
                href={`https://www.ebi.ac.uk/chembl/compound_report_card/${drug.chemblId}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none' }}
              >
                {drug.chemblId} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
              </a>
            ) : (
              'N/A'
            )}
          </span>
        </div>

        <div className="meta-item" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="meta-label">Canonical SMILES</span>
            <button
              onClick={() => handleCopy(drug.smiles, 'smiles')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
            >
              {copiedKey === 'smiles' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              {copiedKey === 'smiles' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <span className="meta-val" style={{ fontSize: '0.78rem' }}>{drug.smiles || 'N/A'}</span>
        </div>

        <div className="meta-item" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="meta-label">InChIKey</span>
            <button
              onClick={() => handleCopy(drug.inchikey, 'inchikey')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
            >
              {copiedKey === 'inchikey' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              {copiedKey === 'inchikey' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <span className="meta-val" style={{ fontSize: '0.78rem' }}>{drug.inchikey || 'N/A'}</span>
        </div>
      </div>
    </div>
  )
}
