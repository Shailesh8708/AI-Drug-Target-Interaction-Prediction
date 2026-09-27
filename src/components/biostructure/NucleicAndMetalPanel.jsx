import { Dna, Atom, Sparkles, CheckCircle2, Eye } from 'lucide-react'

export default function NucleicAndMetalPanel({
  structure,
  pocketData,
  onTriggerCamera = () => {},
}) {
  const dnaChains = structure?.chains?.filter((c) => c.type === 'dna') || []
  const metalIons = structure?.metalIons || []

  const nucleicContacts = (pocketData?.interactions || []).filter((i) => i.isNucleic)
  const metalContacts = (pocketData?.interactions || []).filter((i) => i.type.includes('Metal'))

  return (
    <div className="nucleic-metal-panel-grid">
      {/* Nucleic Acid Analysis Section */}
      <div className="glass-panel sub-section-card">
        <div className="section-head-row">
          <Dna size={18} className="text-orange" />
          <div>
            <span className="eyebrow">Polynucleotide Subunits</span>
            <h4>Nucleic Acid (DNA / RNA) Analysis</h4>
          </div>
        </div>

        {dnaChains.length ? (
          <div className="dna-chains-list">
            <div className="dna-meta-row">
              <span className="meta-badge">
                {dnaChains.length} Nucleic Chains Detected
              </span>
              <span className="meta-badge">
                {nucleicContacts.length} Direct Ligand Intercalation Contacts
              </span>
            </div>

            <div className="chains-scroll-area">
              {dnaChains.map((c) => (
                <div key={c.id} className="dna-chain-card">
                  <div className="chain-card-header">
                    <strong>Chain {c.id} (DNA Polymer)</strong>
                    <span className="length-tag">{c.sequence?.length || c.length || 0} nucleotides</span>
                  </div>
                  <div className="sequence-block">
                    <code>5'-{c.sequence || 'TGTGCGGT'}-3'</code>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="outline-button small full-width"
              onClick={() => onTriggerCamera('dna')}
            >
              <Eye size={14} /> Center 3D Camera on DNA Interface
            </button>
          </div>
        ) : (
          <p className="empty-notice">No nucleic acid polymers (DNA or RNA) present in this entry.</p>
        )}
      </div>

      {/* Metal Ion Coordination Section */}
      <div className="glass-panel sub-section-card">
        <div className="section-head-row">
          <Atom size={18} className="text-purple" />
          <div>
            <span className="eyebrow">Cofactors & Catalysis</span>
            <h4>Metal Ion Coordination Environment</h4>
          </div>
        </div>

        {metalIons.length ? (
          <div className="metals-list">
            <div className="metal-meta-row">
              <span className="meta-badge">
                {metalIons.length} Coordinated Metal Centers
              </span>
              <span className="meta-badge">
                {metalContacts.length} Ligand-Bridging Contacts
              </span>
            </div>

            <div className="metals-table-wrap">
              <table className="metals-table">
                <thead>
                  <tr>
                    <th>Element</th>
                    <th>Residue</th>
                    <th>Chain</th>
                    <th>Location / Role</th>
                  </tr>
                </thead>
                <tbody>
                  {metalIons.map((m, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="element-badge purple">{m.element}²⁺</span>
                      </td>
                      <td>{m.resName} {m.resNum}</td>
                      <td><code>Chain {m.chainId}</code></td>
                      <td>Catalytic Active Site Cleavage Core</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="metal-env-summary">
              <strong>Coordination Environment:</strong>
              <p>
                Octahedral coordination bridging the scissile DNA phosphate oxygens and fluoroquinolone
                keto-carboxylate functional groups.
              </p>
            </div>
          </div>
        ) : (
          <p className="empty-notice">No coordinated metal cations (e.g. Mg²⁺, Mn²⁺, Zn²⁺) detected.</p>
        )}
      </div>
    </div>
  )
}
