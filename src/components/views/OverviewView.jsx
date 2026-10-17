import { useEffect, useRef, useState, useCallback } from 'react'
import CinematicHelixCanvas from '../overview/CinematicHelixCanvas'
import OverviewHeroSection from '../overview/OverviewHeroSection'
import OverviewExplorationSection from '../overview/OverviewExplorationSection'
import OverviewIntelligenceSection from '../overview/OverviewIntelligenceSection'
import OverviewCapabilitiesSection from '../overview/OverviewCapabilitiesSection'
import OverviewResearchConsole from '../overview/OverviewResearchConsole'
import OverviewClosingSection from '../overview/OverviewClosingSection'
import '../overview/cinematicOverview.css'

export default function OverviewView({ navigate, setNotice }) {
  const containerRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState('cinematic')
  const [isAutoSpin, setIsAutoSpin] = useState(true)
  const [telemetry, setTelemetry] = useState({
    azimuth: '0.0',
    distance: '32.0',
    activeBp: 'A-T (Adenine · Thymine)',
    waveIndex: 1,
  })

  // Track window resize for responsive 3D geometry
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 820)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate normalized scroll progress across the storytelling document
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const totalHeight = el.scrollHeight - window.innerHeight

    if (totalHeight <= 0) {
      setScrollProgress(0)
      return
    }

    const currentOffset = Math.max(0, -rect.top)
    const progress = Math.min(Math.max(currentOffset / totalHeight, 0), 1)
    setScrollProgress(progress)

    // Automatically switch back to cinematic mode if the user scrolls deeply into the story
    if (progress > 0.12 && viewMode !== 'cinematic') {
      setViewMode('cinematic')
    }
  }, [viewMode])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="cinematic-overview-root" ref={containerRef}>
      {/* 3D WebGL Helix Background Canvas (Fixed/Sticky Backdrop in Rust Red & Emerald Green) */}
      <div className="cinematic-backdrop-stage" aria-label="Interactive 3D Molecular Backdrop">
        <div className="backdrop-gradient-vignette" />
        <CinematicHelixCanvas
          scrollProgress={scrollProgress}
          isMobile={isMobile}
          viewMode={viewMode}
          isAutoSpin={isAutoSpin}
          onTelemetry={setTelemetry}
        />
      </div>

      {/* Scroll-Driven Cinematic Story Chapters */}
      <div className="cinematic-narrative-flow">
        {/* Section A — Molecular Emergence (Hero with Viewport Controls & Telemetry) */}
        <OverviewHeroSection
          navigate={navigate}
          onScrollToCapabilities={() => scrollToSection('capabilities-section')}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isAutoSpin={isAutoSpin}
          setIsAutoSpin={setIsAutoSpin}
          telemetry={telemetry}
        />

        {/* Section B — Molecular Exploration (Atomic Precision) */}
        <OverviewExplorationSection />

        {/* Section C — Drug Discovery Intelligence (DTI Benchmark) */}
        <OverviewIntelligenceSection navigate={navigate} />

        {/* Section D — Research Capability Storytelling */}
        <OverviewCapabilitiesSection navigate={navigate} />

        {/* Section E — Preserved Live Research Console & Operational Metrics */}
        <OverviewResearchConsole navigate={navigate} setNotice={setNotice} />

        {/* Section F — Closing Transition / Launchpad */}
        <OverviewClosingSection navigate={navigate} />
      </div>
    </div>
  )
}
