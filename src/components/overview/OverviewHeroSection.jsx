import { ArrowUpRight, Dna, FlaskConical, ChevronDown, Activity, Sparkles, ShieldCheck } from 'lucide-react'

export default function OverviewHeroSection({ navigate, onScrollToCapabilities }) {
  return (
    <section className="cinematic-hero-section" id="hero-section">
      <div className="hero-hud-top" aria-hidden="true">
        <div className="hud-badge pulse-badge">
          <span className="hud-live-dot" />
          <span>AEGIS RESEARCH ENVIRONMENT · PHASE 01</span>
        </div>
        <div className="hud-telemetry-strip">
          <span>TOPOLOGY: <strong>B-DNA DUPLEX</strong></span>
          <span className="hud-divider">/</span>
          <span>PITCH: <strong>34.2 Å</strong></span>
          <span className="hud-divider">/</span>
          <span>RESOLUTION: <strong>2.1 Å</strong></span>
          <span className="hud-divider">/</span>
          <span>REF: <strong>RCSB 2XCT</strong></span>
        </div>
      </div>

      <div className="hero-content-wrapper">
        <div className="hero-narrative-block">
          <div className="hero-eyebrow">
            <Sparkles size={14} className="eyebrow-icon" />
            <span>MOLECULAR RECOGNITION & BIOPHYSICAL INTELLIGENCE</span>
          </div>

          <h1 className="cinematic-headline">
            <span className="headline-line line-1">Decoding Molecules.</span>
            <span className="headline-line line-2">Accelerating Discovery.</span>
          </h1>

          <p className="cinematic-subtext">
            An AI-powered research environment for exploring molecular structures,
            analyzing compounds, investigating drug–target interactions, and
            supporting data-driven pharmaceutical discovery.
          </p>

          <div className="hero-action-cluster">
            <button
              className="cinematic-btn primary-glow-btn"
              onClick={() => navigate('biostructure')}
              aria-label="Explore Research Platform via BioStructure Hub"
            >
              <Dna size={16} />
              <span>Explore Research Platform</span>
              <ArrowUpRight size={15} />
            </button>

            <button
              className="cinematic-btn secondary-ghost-btn"
              onClick={onScrollToCapabilities}
              aria-label="Discover Platform Capabilities"
            >
              <FlaskConical size={16} />
              <span>Discover Capabilities</span>
            </button>
          </div>

          <div className="hero-footer-status">
            <div className="status-indicator-item">
              <span className="mini-status-dot green" />
              <span>BioStructure 3D intelligence active</span>
            </div>
            <div className="status-indicator-item">
              <span className="mini-status-dot blue" />
              <span>Neural model registry standby</span>
            </div>
            <div className="status-indicator-item">
              <span className="mini-status-dot orange" />
              <span>3 inventory alerts monitored</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-cue" onClick={onScrollToCapabilities} role="button" tabIndex={0} aria-label="Scroll to explore narrative">
        <span className="scroll-cue-text">SCROLL TO EXPLORE</span>
        <div className="scroll-cue-indicator">
          <div className="scroll-cue-line" />
          <ChevronDown size={14} className="scroll-cue-arrow" />
        </div>
      </div>
    </section>
  )
}

