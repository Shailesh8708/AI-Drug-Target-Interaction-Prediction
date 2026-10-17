import {
  ArrowUpRight,
  Dna,
  FlaskConical,
  ChevronDown,
  Sparkles,
  Layers,
  Zap,
  RotateCcw,
  Eye,
  Pause,
  Play,
  Crosshair,
} from 'lucide-react'

export default function OverviewHeroSection({
  navigate,
  onScrollToCapabilities,
  viewMode = 'cinematic',
  setViewMode = () => {},
  isAutoSpin = true,
  setIsAutoSpin = () => {},
  telemetry = { azimuth: '0.0', distance: '32.0', activeBp: 'A-T (Adenine · Thymine)', waveIndex: 1 },
}) {
  return (
    <section className="cinematic-hero-section" id="hero-section">
      {/* Top Scientific HUD with Live Real-Time Telemetry */}
      <div className="hero-hud-top" aria-label="Scientific Telemetry HUD">
        <div className="hud-badge pulse-badge">
          <span className="hud-live-dot" />
          <span>AEGIS RESEARCH ENVIRONMENT · PHASE 01</span>
        </div>
        <div className="hud-telemetry-strip">
          <span>TOPOLOGY: <strong>B-DNA DUPLEX</strong></span>
          <span className="hud-divider">/</span>
          <span>AZIMUTH: <strong className="live-highlight">{telemetry.azimuth}°</strong></span>
          <span className="hud-divider">/</span>
          <span>FOCAL DIST: <strong>{telemetry.distance} Å</strong></span>
          <span className="hud-divider">/</span>
          <span>ACTIVE BP: <strong className="live-highlight">{telemetry.activeBp}</strong></span>
          <span className="hud-divider">/</span>
          <span>REF: <strong>RCSB 2XCT</strong></span>
        </div>
      </div>

      {/* Interactive 3D Viewport Controls Pill Bar */}
      <div className="viewport-controls-container" aria-label="3D Model Interactive Viewport Controls">
        <div className="viewport-controls-label">
          <Eye size={13} className="eyebrow-icon" />
          <span>Interactive 3D Inspector</span>
          <span className="viewport-drag-hint">· Drag canvas to freely orbit</span>
        </div>

        <div className="viewport-pills-cluster">
          <button
            type="button"
            className={`view-mode-pill ${viewMode === 'cinematic' ? 'active' : ''}`}
            onClick={() => setViewMode('cinematic')}
            aria-pressed={viewMode === 'cinematic'}
            aria-label="Cinematic scroll-driven flow mode"
          >
            <Layers size={12} />
            <span>Cinematic Flow</span>
          </button>

          <button
            type="button"
            className={`view-mode-pill ${viewMode === 'duplex' ? 'active' : ''}`}
            onClick={() => setViewMode('duplex')}
            aria-pressed={viewMode === 'duplex'}
            aria-label="Inspect major groove and base pairs"
          >
            <Crosshair size={12} />
            <span>Duplex Zoom</span>
          </button>

          <button
            type="button"
            className={`view-mode-pill ${viewMode === 'ligand' ? 'active' : ''}`}
            onClick={() => setViewMode('ligand')}
            aria-pressed={viewMode === 'ligand'}
            aria-label="Focus on small molecule binding pocket"
          >
            <Zap size={12} />
            <span>Ligand Cleft</span>
          </button>

          <button
            type="button"
            className={`view-mode-pill ${viewMode === 'axial' ? 'active' : ''}`}
            onClick={() => setViewMode('axial')}
            aria-pressed={viewMode === 'axial'}
            aria-label="Axial top-down helical view"
          >
            <RotateCcw size={12} />
            <span>Axial View</span>
          </button>

          <button
            type="button"
            className="spin-toggle-pill"
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            aria-label={isAutoSpin ? 'Pause 3D rotation' : 'Resume 3D rotation'}
          >
            {isAutoSpin ? <Pause size={11} /> : <Play size={11} />}
            <span>{isAutoSpin ? 'Pause' : 'Spin'}</span>
          </button>
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
              <span className="mini-status-dot rust" />
              <span>Neural model registry standby</span>
            </div>
            <div className="status-indicator-item">
              <span className="mini-status-dot orange" />
              <span>3 inventory alerts monitored</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="hero-scroll-cue"
        onClick={onScrollToCapabilities}
        role="button"
        tabIndex={0}
        aria-label="Scroll to explore narrative"
      >
        <span className="scroll-cue-text">SCROLL TO EXPLORE</span>
        <div className="scroll-cue-indicator">
          <div className="scroll-cue-line" />
          <ChevronDown size={14} className="scroll-cue-arrow" />
        </div>
      </div>
    </section>
  )
}
