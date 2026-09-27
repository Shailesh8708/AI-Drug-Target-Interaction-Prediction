import { useState } from 'react'
import {
  Flame,
  Layers,
  Sparkles,
  Sliders,
  Filter,
  CheckCircle2,
  Atom,
  Eye,
  Info,
} from 'lucide-react'

export default function BindingSiteIntelligence({
  pocketData,
  cutoff = 4.5,
  onCutoffChange = () => {},
  showPocket = false,
  onToggleShowPocket = () => {},
  showInteractions = true,
  onToggleShowInteractions = () => {},
  selectedResidueId = null,
  onSelectResidue = () => {},
  learnMode = false,
}) {
  const [filterType, setFilterType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const summary = pocketData?.summary || {}
  const interactions = pocketData?.interactions || []
  const pocketResidues = pocketData?.pocketResidues || []

  // Filter interaction contacts
  const filteredInteractions = interactions.filter((int) => {
    if (filterType !== 'ALL' && !int.type.includes(filterType)) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        int.residueName.toLowerCase().includes(q) ||
        String(int.residueNumber).includes(q) ||
        int.ligandAtom.toLowerCase().includes(q) ||
        int.type.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="binding-site-intelligence-panel glass-panel">
      {/* Panel Title & Controls */}
      <div className="panel-heading compact">
        <div>
          <div className="badge-flame-row">
            <Flame size={18} className="text-orange" />
            <p className="eyebrow">Signature Feature · Active Site Microenvironment</p>
          </div>
          <h3>🔥 Binding Site Intelligence</h3>
          <p className="panel-subtext">
            Understand the molecular environment surrounding the bound ligand.
          </p>
        </div>

        <div className="pocket-switches-group">
          <label className="toggle-chip active">
            <input
              type="checkbox"
              checked={showPocket}
              onChange={(e) => onToggleShowPocket(e.target.checked)}
            />
            <span className="chip-label">Highlight Pocket Residues</span>
          </label>

          <label className="toggle-chip active">
            <input
              type="checkbox"
              checked={showInteractions}
              onChange={(e) => onToggleShowInteractions(e.target.checked)}
            />
            <span className="chip-label">Show 3D Contact Lines</span>
          </label>
        </div>
      </div>

      {learnMode && (
        <div className="learn-badge">
          <Info size={13} />
          <span>
            Binding Site Intelligence computes atom-to-atom contacts below a defined distance
            cutoff to map hydrogen bonds, ionic salt-bridges, and hydrophobic surfaces.
          </span>
        </div>
      )}

      {/* Pocket Metrics Cards */}
      <div className="pocket-metrics-grid">
        <div className="pocket-metric-card">
          <span className="metric-label">Pocket Residues</span>
          <strong>{summary.totalResidues ?? 0}</strong>
          <small>within {cutoff} Å radius</small>
        </div>

        <div className="pocket-metric-card accent-hbond">
          <span className="metric-label">Hydrogen Bonds</span>
          <strong>{summary.hBondsCount ?? 0}</strong>
          <small>polar donor/acceptors</small>
        </div>

        <div className="pocket-metric-card accent-hydrophobic">
          <span className="metric-label">Hydrophobic Contacts</span>
          <strong>{summary.hydrophobicCount ?? 0}</strong>
          <small>non-polar carbon pairs</small>
        </div>

        <div className="pocket-metric-card accent-ionic">
          <span className="metric-label">Ionic / Salt Bridges</span>
          <strong>{summary.ionicCount ?? 0}</strong>
          <small>electrostatic anchors</small>
        </div>

        <div className="pocket-metric-card accent-metal">
          <span className="metric-label">Metal Coordination</span>
          <strong>{summary.metalCount ?? 0}</strong>
          <small>coordination sphere</small>
        </div>
      </div>

      {/* Pocket Radius Slider & Profile Breakdown */}
      <div className="pocket-radius-and-profile">
        {/* Radius Slider Card */}
        <div className="sub-card radius-card">
          <div className="slider-header-row">
            <span className="sub-title">Contact Sphere Cutoff</span>
            <strong className="radius-val">{cutoff.toFixed(1)} Å</strong>
          </div>
          <input
            type="range"
            min="3.0"
            max="8.0"
            step="0.5"
            value={cutoff}
            onChange={(e) => onCutoffChange(Number.parseFloat(e.target.value))}
            className="radius-slider"
          />
          <div className="slider-ticks">
            <span>3.0 Å (Strict)</span>
            <span>4.5 Å (Standard)</span>
            <span>8.0 Å (Extended)</span>
          </div>
        </div>

        {/* Pocket Chemical Profile Card */}
        <div className="sub-card profile-card">
          <span className="sub-title">Pocket Chemical Profile (Estimated)</span>
          <div className="profile-bars-grid">
            <div className="profile-stat">
              <span>Hydrophobic:</span>
              <strong>{summary.composition?.hydrophobic ?? 0}</strong>
            </div>
            <div className="profile-stat">
              <span>Polar:</span>
              <strong>{summary.composition?.polar ?? 0}</strong>
            </div>
            <div className="profile-stat">
              <span>Charged:</span>
              <strong>{summary.composition?.charged ?? 0}</strong>
            </div>
            {summary.composition?.nucleic > 0 && (
              <div className="profile-stat">
                <span>DNA Bases:</span>
                <strong>{summary.composition?.nucleic}</strong>
              </div>
            )}
            <div className="profile-stat">
              <span>Pocket Volume:</span>
              <strong>~{summary.estimatedVolume ?? '—'} Å³</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2D Interactive Interaction Map Diagram */}
      <div className="interaction-map-section">
        <div className="section-mini-heading">
          <span className="eyebrow">Topology Map</span>
          <h4>2D Protein–Ligand Interaction Schematic</h4>
          <small>Click any surrounding residue node to zoom and highlight it in the 3D viewer</small>
        </div>

        <div className="schematic-diagram-box">
          {/* Surrounding residue nodes */}
          <div className="schematic-ring">
            {pocketResidues.slice(0, 12).map((res, idx) => {
              const total = Math.min(pocketResidues.length, 12)
              const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
              const radius = 130 // px
              const left = 200 + radius * Math.cos(angle)
              const top = 150 + radius * Math.sin(angle)
              const isSelected = selectedResidueId === res.residueId
              const mainType = res.interactions?.[0] || 'Contact'

              return (
                <button
                  key={res.residueId}
                  className={`schematic-node ${isSelected ? 'active' : ''} ${res.isNucleic ? 'nucleic' : ''}`}
                  style={{ left: `${left}px`, top: `${top}px` }}
                  onClick={() => onSelectResidue(res.residueId)}
                  title={`${res.resName} ${res.resNum} (${res.chainId}) - ${res.minDistance} Å`}
                >
                  <span className="node-name">{res.resName} {res.resNum}</span>
                  <span className="node-dist">{res.minDistance}Å</span>
                  <small className="node-type">{mainType.slice(0, 4)}</small>
                </button>
              )
            })}

            {/* Central Ligand Node */}
            <div className="schematic-center-ligand">
              <Atom size={20} className="text-cyan animate-pulse" />
              <strong>{pocketData?.ligandId || 'LIGAND'}</strong>
              <small>Active Core</small>
            </div>
          </div>
        </div>
      </div>

      {/* Residue Contact Analysis Table */}
      <div className="residue-contacts-table-section">
        <div className="contacts-table-toolbar">
          <div>
            <span className="eyebrow">Contact Table</span>
            <h4>Atomic Distance & Interaction Directory</h4>
          </div>

          <div className="table-filters-row">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Interactions ({interactions.length})</option>
              <option value="Hydrogen">Hydrogen Bonds ({summary.hBondsCount || 0})</option>
              <option value="Hydrophobic">Hydrophobic ({summary.hydrophobicCount || 0})</option>
              <option value="Ionic">Ionic / Salt Bridge ({summary.ionicCount || 0})</option>
              <option value="Metal">Metal Coordination ({summary.metalCount || 0})</option>
            </select>

            <input
              type="text"
              placeholder="Search residue (e.g. TYR, 123)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="table-search-input"
            />
          </div>
        </div>

        <div className="contacts-table-scroll-wrap">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Residue</th>
                <th>Chain</th>
                <th>Distance</th>
                <th>Interaction Classification</th>
                <th>Ligand Atom</th>
                <th>Target Atom</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInteractions.length ? (
                filteredInteractions.slice(0, 100).map((int) => {
                  const isSelected = selectedResidueId === int.residueId
                  return (
                    <tr
                      key={int.id}
                      className={isSelected ? 'selected-row' : ''}
                      onClick={() => onSelectResidue(int.residueId)}
                    >
                      <td>
                        <strong>{int.residueName} {int.residueNumber}</strong>
                        {int.isNucleic && <span className="nucleic-tag">DNA</span>}
                      </td>
                      <td><code>Chain {int.chainId}</code></td>
                      <td>
                        <span className="distance-badge">{int.distance} Å</span>
                      </td>
                      <td>
                        <span className={`interaction-pill ${int.type.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                          {int.type}
                        </span>
                      </td>
                      <td><code>{int.ligandAtom} ({int.ligandElement})</code></td>
                      <td><code>{int.atomName} ({int.atomElement})</code></td>
                      <td>
                        <button
                          className="quiet-button small"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectResidue(int.residueId)
                          }}
                        >
                          <Eye size={12} /> Focus in 3D
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    No contacts matched the current filters.
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
