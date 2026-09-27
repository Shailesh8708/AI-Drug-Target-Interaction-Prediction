import { useState } from 'react'
import { Bookmark, Copy, Check, ExternalLink, Dna, GitCompare, FlaskConical, Atom, Shield } from 'lucide-react'
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

  const isElement = drug.entityType === 'ELEMENT'
  const isProtein = drug.entityType === 'PROTEIN' || drug.entityType === 'PROTEIN-LIGAND COMPLEX'
  const categoryBadge = drug.categoryLabel || (isElement ? 'Chemical Element' : isProtein ? 'Macromolecular Protein' : 'Drug / Small Molecule')

  return (
    <div className="drug-profile-banner">
      <div className="banner-glow-orb" />

      <div className="profile-main-row">
        <div className="drug-name-classification">
          <div className="drug-primary-name">
            {drug.name}
            <span
              className="approval-badge"
              style={{
                backgroundColor: isElement
                  ? 'rgba(16, 185, 129, 0.2)'
                  : isProtein
                  ? 'rgba(56, 189, 248, 0.2)'
                  : 'rgba(16, 185, 129, 0.2)',
                color: isElement ? '#34d399' : isProtein ? '#38bdf8' : '#34d399',
                borderColor: isElement ? 'rgba(16, 185, 129, 0.4)' : isProtein ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)',
              }}
            >
              {categoryBadge}
            </span>
          </div>

          <div className="drug-class-tag">{drug.class || drug.drugClass || 'Chemical Entity'}</div>

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

      {/* Adaptive Identity Meta Grid */}
      <div className="identity-meta-grid">
        {isElement ? (
          <>
            <div className="meta-item">
              <span className="meta-label">Atomic Number (Z)</span>
              <span className="meta-val">{drug.atomicNumber || drug.number || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Atomic Weight</span>
              <span className="meta-val">{drug.mass ? `${Number(drug.mass).toFixed(3)} u` : drug.mw ? `${drug.mw.toFixed(3)} u` : 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Periodic Block</span>
              <span className="meta-val">Group {drug.group} · Period {drug.period} ({drug.block}-block)</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Standard State</span>
              <span className="meta-val" style={{ textTransform: 'capitalize' }}>{drug.standardState || drug.state || 'Solid'}</span>
            </div>
            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <span className="meta-label">Electron Configuration</span>
              <span className="meta-val" style={{ fontFamily: 'monospace' }}>{drug.electronConfig || 'N/A'}</span>
            </div>
            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <span className="meta-label">Crystalline System</span>
              <span className="meta-val" style={{ textTransform: 'capitalize' }}>{drug.crystalStructure || drug.crystal || 'Not determined'}</span>
            </div>
          </>
        ) : isProtein ? (
          <>
            <div className="meta-item">
              <span className="meta-label">Structural Accession</span>
              <span className="meta-val">{drug.pdbId ? `PDB: ${drug.pdbId}` : drug.uniprotId ? `UniProt: ${drug.uniprotId}` : 'Macromolecule'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Resolution</span>
              <span className="meta-val">{drug.resolution || '2.10 Å'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Method</span>
              <span className="meta-val">{drug.experimentalMethod || 'X-RAY DIFFRACTION'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Protein Chains</span>
              <span className="meta-val">{Array.isArray(drug.chains) ? `${drug.chains.length} chains (${drug.chains.join(', ')})` : '2 chains'}</span>
            </div>
            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <span className="meta-label">Source Organism</span>
              <span className="meta-val">{drug.organism || 'Biological Specimen'}</span>
            </div>
            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <span className="meta-label">Co-crystallized Ligands</span>
              <span className="meta-val">{drug.ligands?.length ? drug.ligands.map(l => l.name || l.id).join(', ') : 'Apo-form / Native assembly'}</span>
            </div>
          </>
        ) : (
          <>
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
                {drug.chemblId && drug.chemblId !== 'N/A' ? (
                  <a
                    href={`https://www.ebi.ac.uk/chembl/compound_report_card/${drug.chemblId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'none' }}
                  >
                    {drug.chemblId} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                  </a>
                ) : (
                  'Curated / Unassigned'
                )}
              </span>
            </div>

            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="meta-label">Canonical SMILES</span>
                {drug.smiles && (
                  <button
                    onClick={() => handleCopy(drug.smiles, 'smiles')}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                  >
                    {copiedKey === 'smiles' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedKey === 'smiles' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <span className="meta-val" style={{ fontSize: '0.78rem' }}>{drug.smiles || 'N/A'}</span>
            </div>

            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="meta-label">InChIKey</span>
                {(drug.inchikey || drug.inchiKey) && (
                  <button
                    onClick={() => handleCopy(drug.inchikey || drug.inchiKey, 'inchikey')}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                  >
                    {copiedKey === 'inchikey' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedKey === 'inchikey' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <span className="meta-val" style={{ fontSize: '0.78rem' }}>{drug.inchikey || drug.inchiKey || 'N/A'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
