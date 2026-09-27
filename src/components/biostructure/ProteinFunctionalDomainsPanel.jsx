import { useState } from 'react'
import {
  Layers,
  Sparkles,
  Flame,
  Atom,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Target,
  Info,
} from 'lucide-react'

export default function ProteinFunctionalDomainsPanel({
  domains = [],
  activeSites = [],
  metalBinding = [],
  sequenceLength = 300,
  onHighlightResidues = () => {},
  learnMode = false,
}) {
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [selectedSite, setSelectedSite] = useState(null)

  const handleDomainClick = (domain) => {
    setSelectedDomain(domain.name)
    setSelectedSite(null)
    onHighlightResidues({
      start: domain.start,
      end: domain.end,
      label: domain.name,
      type: 'domain',
    })
  }

  const handleSiteClick = (site) => {
    setSelectedSite(site.position)
    setSelectedDomain(null)
    onHighlightResidues({
      position: site.position,
      residue: site.residue,
      label: site.role,
      type: 'active-site',
    })
  }

  return (
    <div className="glass-panel functional-domains-panel">
      {/* Panel Heading */}
      <div className="panel-heading compact">
        <div>
          <div className="badge-flame-row">
            <Layers size={18} className="text-cyan" />
            <p className="eyebrow">Structural Architecture · [DATABASE ANNOTATION]</p>
          </div>
          <h3>🧬 Functional Domains, Motifs & Catalytic Sites</h3>
          <p className="panel-subtext">
            Modular protein architecture, catalytic triads, binding clefts, and metal coordination centers.
          </p>
        </div>

        {learnMode && (
          <div className="learn-badge">
            <Info size={13} />
            <span>Click any domain or active site to highlight its exact 3D coordinates.</span>
          </div>
        )}
      </div>

      {/* Visual Domain Architecture Track */}
      <div className="domain-track-container">
        <div className="track-title-row">
          <span className="track-label">Domain Topology (Residues 1 → {sequenceLength})</span>
          <span className="track-len">{sequenceLength} aa</span>
        </div>
        <div className="domain-architecture-bar">
          {domains.map((dom, idx) => {
            const leftPercent = Math.max(0, Math.min(100, (dom.start / sequenceLength) * 100))
            const widthPercent = Math.max(4, Math.min(100 - leftPercent, ((dom.end - dom.start) / sequenceLength) * 100))
            const isSelected = selectedDomain === dom.name

            return (
              <div
                key={dom.name + idx}
                className={`domain-segment-block ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                onClick={() => handleDomainClick(dom)}
                title={`${dom.name} (Residues ${dom.start}-${dom.end})`}
              >
                <span className="segment-label">{dom.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Grid: Domains & Active Sites */}
      <div className="domains-sites-grid">
        {/* Left Column: Domains List */}
        <div className="domains-column">
          <div className="col-header">
            <h4>Annotated Domains & Structural Folds</h4>
            <span className="count-badge">{domains.length} Identified</span>
          </div>

          <div className="domains-list">
            {domains.length ? (
              domains.map((dom, idx) => {
                const isSelected = selectedDomain === dom.name
                return (
                  <div
                    key={dom.name + idx}
                    className={`domain-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleDomainClick(dom)}
                  >
                    <div className="card-top">
                      <strong className="dom-name">{dom.name}</strong>
                      <span className="dom-type-tag">{dom.type || 'Fold'}</span>
                    </div>
                    <div className="card-bottom">
                      <span className="dom-span">
                        Residues <strong>{dom.start}</strong> to <strong>{dom.end}</strong>
                      </span>
                      <span className="dom-len">{dom.end - dom.start + 1} residues</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty-substate">
                <p>No specific domain boundaries deposited for this sequence fold.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Catalytic Active Sites & Metal Coordination */}
        <div className="sites-column">
          <div className="col-header">
            <h4>Catalytic Active Sites & Cofactor Contacts</h4>
            <span className="count-badge">{activeSites.length + metalBinding.length} Sites</span>
          </div>

          <div className="sites-list">
            {activeSites.length ? (
              activeSites.map((site, idx) => {
                const isSelected = selectedSite === site.position
                return (
                  <div
                    key={site.position + '-' + idx}
                    className={`active-site-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSiteClick(site)}
                  >
                    <div className="site-badge">
                      <Flame size={14} className="text-orange" />
                      <span className="site-res">{site.residue} {site.position}</span>
                    </div>
                    <div className="site-info">
                      <p className="site-role">{site.role}</p>
                      <span className="click-hint">Click to center in 3D</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty-substate">
                <p>No active site catalytic annotations in record.</p>
              </div>
            )}

            {/* Metal Binding Coordination */}
            {metalBinding.length > 0 && (
              <div className="metal-coordination-subgroup">
                <h5>Structural / Catalytic Metal Ions</h5>
                {metalBinding.map((m, idx) => (
                  <div key={m.element + idx} className="metal-site-card">
                    <Atom size={14} className="text-magenta" />
                    <div>
                      <strong>{m.element} ({m.charge ? `${m.charge}+` : 'Ion'})</strong>
                      <p>{m.coordination || 'Catalytic metal coordination center'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
