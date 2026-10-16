import { Compass, Layers, Atom, Activity, Zap } from 'lucide-react'

export default function OverviewExplorationSection() {
  return (
    <section className="cinematic-chapter-section" id="exploration-section">
      <div className="chapter-inner-content">
        <div className="chapter-header-badge">
          <Compass size={14} className="chapter-badge-icon" />
          <span>SECTION B · MACROMOLECULAR ARCHITECTURE</span>
        </div>

        <h2 className="chapter-title">
          <span>Precision at the</span>
          <span className="accent-text-glow"> Atomic Frontier.</span>
        </h2>

        <p className="chapter-lead-text">
          From secondary structure motifs to allosteric binding pockets, AEGIS
          translates macromolecular complexity into actionable biophysical coordinates.
        </p>

        <div className="annotations-grid">
          <div className="annotation-card">
            <div className="annotation-line-indicator" />
            <div className="annotation-content">
              <div className="annotation-tag">
                <Zap size={12} />
                <span>MAJOR GROOVE BINDING CLEFT</span>
              </div>
              <h4>Electrostatic Surface Accessibility</h4>
              <p>
                Sequence-specific hydrogen-bond donor and acceptor patterns
                providing target geometry for small-molecule intercalation and
                kinase regulatory binding.
              </p>
              <div className="annotation-telemetry">
                <span>WIDTH: <strong>12.0 Å</strong></span>
                <span>DEPTH: <strong>8.5 Å</strong></span>
              </div>
            </div>
          </div>

          <div className="annotation-card">
            <div className="annotation-line-indicator" />
            <div className="annotation-content">
              <div className="annotation-tag">
                <Layers size={12} />
                <span>PHOSPHODIESTER BACKBONE</span>
              </div>
              <h4>Antiparallel Helical Symmetry</h4>
              <p>
                3′→5′ and 5′→3′ phosphodiester strands stabilized by base-stacking
                van der Waals interactions and divalent cation coordination.
              </p>
              <div className="annotation-telemetry">
                <span>RISE/TURN: <strong>34.2 Å</strong></span>
                <span>ROTATION: <strong>36.0°/BP</strong></span>
              </div>
            </div>
          </div>

          <div className="annotation-card">
            <div className="annotation-line-indicator" />
            <div className="annotation-content">
              <div className="annotation-tag">
                <Activity size={12} />
                <span>HYDRATION SHELL DYNAMICS</span>
              </div>
              <h4>Solvent-Accessible Surface (SASA)</h4>
              <p>
                Water molecule exclusion profiling and boundary solvation energy
                mapping to score druggability and predict binding pocket stability.
              </p>
              <div className="annotation-telemetry">
                <span>SASA: <strong>1,840 Å²</strong></span>
                <span>POCKET VOL: <strong>512 Å³</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="biophysical-readout-strip">
          <div className="readout-item">
            <small>BASE-TO-BASE RISE</small>
            <strong>3.4 Å</strong>
          </div>
          <div className="readout-item">
            <small>HELICAL REPEAT</small>
            <strong>10.5 bp / turn</strong>
          </div>
          <div className="readout-item">
            <small>DUPLEX DIAMETER</small>
            <strong>20.0 Å</strong>
          </div>
          <div className="readout-item">
            <small>CANONICAL BASE PAIRS</small>
            <strong>38 Pairs Modeled</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

