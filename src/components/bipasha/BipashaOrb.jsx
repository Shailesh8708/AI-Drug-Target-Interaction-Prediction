import { useEffect, useRef, useState, useId } from 'react'
import { useBipasha } from './BipashaContext'

export default function BipashaOrb() {
  const { isOpen, toggleOpen, agentState, setAgentState } = useBipasha()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [rippleActive, setRippleActive] = useState(false)
  const tooltipId = useId()

  // 3D Particles & Molecular Nodes initialization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let angleX = 0.2
    let angleY = 0
    let angleZ = 0
    let pulseAngle = 0

    // Set high-DPI resolution
    const dpr = window.devicePixelRatio || 1
    const size = 84
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    // Molecular Orbit Nodes in 3D
    const orbitalNodes = [
      // Ring A (inclined 35 deg)
      { r: 24, theta: 0, phi: 0.6, size: 2.6, color: '#6ee7b7' },
      { r: 24, theta: Math.PI * 0.5, phi: 0.6, size: 2.2, color: '#34d399' },
      { r: 24, theta: Math.PI, phi: 0.6, size: 2.8, color: '#a7f3d0' },
      { r: 24, theta: Math.PI * 1.5, phi: 0.6, size: 2.0, color: '#34d399' },
      // Ring B (inclined -40 deg)
      { r: 22, theta: Math.PI * 0.25, phi: -0.7, size: 2.4, color: '#38bdf8' },
      { r: 22, theta: Math.PI * 0.75, phi: -0.7, size: 2.0, color: '#6ee7b7' },
      { r: 22, theta: Math.PI * 1.25, phi: -0.7, size: 2.5, color: '#38bdf8' },
      { r: 22, theta: Math.PI * 1.75, phi: -0.7, size: 1.8, color: '#6ee7b7' },
      // Floating Valence Particles
      { r: 16, theta: 1.2, phi: 1.1, size: 1.8, color: '#fef08a' },
      { r: 28, theta: 3.4, phi: -0.2, size: 1.6, color: '#93c5fd' },
      { r: 18, theta: 4.8, phi: 0.9, size: 2.1, color: '#6ee7b7' },
    ]

    // Predefined molecular bonds between specific nodes
    const nodeBonds = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [2, 6], [8, 0], [10, 2],
    ]

    const checkReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const render = () => {
      ctx.clearRect(0, 0, size, size)

      const centerX = size / 2
      const centerY = size / 2

      // Rotation speeds tuned to agent state
      let speedMult = 1
      if (agentState === 'thinking') speedMult = 2.4
      else if (agentState === 'navigating') speedMult = 2.8
      else if (isHovered) speedMult = 1.4
      if (checkReducedMotion) speedMult = 0.15

      angleY += 0.016 * speedMult
      angleX += 0.007 * speedMult
      pulseAngle += 0.03 * speedMult

      const pulseScale = 1 + Math.sin(pulseAngle) * 0.045
      const baseRadius = 18 * pulseScale

      // 1. Soft Outer Volumetric Glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.4, centerX, centerY, size * 0.46)
      if (agentState === 'error') {
        glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)')
        glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.22)')
        glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)')
      } else if (agentState === 'thinking' || agentState === 'navigating') {
        glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.75)')
        glowGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.35)')
        glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)')
      } else {
        glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.55)')
        glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)')
        glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)')
      }
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.46, 0, Math.PI * 2)
      ctx.fill()

      // Calculate 3D projected coordinates for nodes
      const projectedNodes = orbitalNodes.map((node, index) => {
        // Spherical to Cartesian
        const currentTheta = node.theta + angleY * (index % 2 === 0 ? 1 : -0.8)
        let x = node.r * Math.cos(currentTheta) * Math.cos(node.phi)
        let y = node.r * Math.sin(node.phi)
        let z = node.r * Math.sin(currentTheta) * Math.cos(node.phi)

        // Rotate X
        const cosX = Math.cos(angleX)
        const sinX = Math.sin(angleX)
        const y1 = y * cosX - z * sinX
        const z1 = y * sinX + z * cosX

        // 3D Perspective Projection
        const focalLength = 70
        const projScale = focalLength / (focalLength + z1)
        const projX = centerX + x * projScale
        const projY = centerY + y1 * projScale

        return {
          projX,
          projY,
          z: z1,
          projScale,
          size: node.size * projScale,
          color: node.color,
          origIndex: index,
        }
      })

      // Separate background vs foreground nodes for correct 3D depth interleaving
      const bgNodes = projectedNodes.filter((n) => n.z < 0)
      const fgNodes = projectedNodes.filter((n) => n.z >= 0)

      // Draw Background Bonds (behind central sphere)
      nodeBonds.forEach(([i, j]) => {
        const p1 = projectedNodes[i]
        const p2 = projectedNodes[j]
        if (p1.z < 0 || p2.z < 0) {
          const avgZ = (p1.z + p2.z) / 2
          const alpha = Math.max(0.12, Math.min(0.4, (avgZ + 25) / 50))
          ctx.strokeStyle = `rgba(110, 231, 183, ${alpha * 0.5})`
          ctx.lineWidth = 0.7
          ctx.setLineDash([1.5, 2])
          ctx.beginPath()
          ctx.moveTo(p1.projX, p1.projY)
          ctx.lineTo(p2.projX, p2.projY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

      // Draw Background Nodes
      bgNodes.forEach((node) => {
        const alpha = Math.max(0.2, (node.z + 28) / 45)
        ctx.fillStyle = node.color
        ctx.globalAlpha = alpha * 0.6
        ctx.beginPath()
        ctx.arc(node.projX, node.projY, Math.max(0.8, node.size * 0.8), 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // 2. Central 3D Core Sphere with Realistic Volumetric Lighting
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
      ctx.clip()

      // 3D Sphere Shading with highlight shifted top-left
      const lightX = centerX - baseRadius * 0.35
      const lightY = centerY - baseRadius * 0.35
      const sphereGrad = ctx.createRadialGradient(lightX, lightY, 1, centerX, centerY, baseRadius)

      if (agentState === 'error') {
        sphereGrad.addColorStop(0, '#fef2f2')
        sphereGrad.addColorStop(0.2, '#f87171')
        sphereGrad.addColorStop(0.65, '#dc2626')
        sphereGrad.addColorStop(1, '#7f1d1d')
      } else if (agentState === 'thinking') {
        sphereGrad.addColorStop(0, '#f0fdf4')
        sphereGrad.addColorStop(0.25, '#6ee7b7')
        sphereGrad.addColorStop(0.65, '#059669')
        sphereGrad.addColorStop(0.9, '#0284c7')
        sphereGrad.addColorStop(1, '#064e3b')
      } else {
        sphereGrad.addColorStop(0, '#ffffff')
        sphereGrad.addColorStop(0.18, '#a7f3d0')
        sphereGrad.addColorStop(0.5, '#10b981')
        sphereGrad.addColorStop(0.82, '#059669')
        sphereGrad.addColorStop(1, '#064e3b')
      }

      ctx.fillStyle = sphereGrad
      ctx.fill()

      // Internal Molecular Energy Rings inside the sphere
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, baseRadius * 0.72, baseRadius * 0.3, angleY * 0.6, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(167, 243, 208, 0.4)'
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, baseRadius * 0.55, baseRadius * 0.22, -angleY * 0.8, 0, Math.PI * 2)
      ctx.stroke()

      // Specular Glass Reflection Crescent
      const specGrad = ctx.createLinearGradient(centerX - baseRadius, centerY - baseRadius, centerX, centerY)
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)')
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = specGrad
      ctx.beginPath()
      ctx.arc(centerX - 2, centerY - 2, baseRadius * 0.85, Math.PI, Math.PI * 1.5)
      ctx.lineTo(centerX - 2, centerY - 2)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Draw Foreground Bonds (over front of sphere)
      nodeBonds.forEach(([i, j]) => {
        const p1 = projectedNodes[i]
        const p2 = projectedNodes[j]
        if (p1.z >= 0 && p2.z >= 0) {
          const avgZ = (p1.z + p2.z) / 2
          const alpha = Math.min(0.85, 0.35 + (avgZ / 30) * 0.45)
          ctx.strokeStyle = `rgba(167, 243, 208, ${alpha})`
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.moveTo(p1.projX, p1.projY)
          ctx.lineTo(p2.projX, p2.projY)
          ctx.stroke()
        }
      })

      // Draw Foreground Nodes with Specular Glow
      fgNodes.forEach((node) => {
        const alpha = Math.min(1, 0.5 + (node.z / 25) * 0.5)

        // Node halo
        ctx.fillStyle = `rgba(110, 231, 183, ${alpha * 0.35})`
        ctx.beginPath()
        ctx.arc(node.projX, node.projY, node.size * 1.8, 0, Math.PI * 2)
        ctx.fill()

        // Node core
        ctx.fillStyle = node.color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(node.projX, node.projY, node.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [agentState, isHovered])

  const handleClick = (e) => {
    e.stopPropagation()
    setRippleActive(true)
    setTimeout(() => setRippleActive(false), 700)
    toggleOpen()
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (agentState === 'idle') setAgentState('hover')
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (agentState === 'hover') setAgentState('idle')
  }

  return (
    <div
      ref={containerRef}
      className={`bipasha-orb-wrapper ${isOpen ? 'is-open' : ''} state-${agentState}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Floating Trigger Button */}
      <button
        type="button"
        className="bipasha-orb-button"
        onClick={handleClick}
        aria-label={isOpen ? 'Minimize Bipasha Mam AI Assistant' : 'Open Bipasha Mam AI Assistant'}
        aria-expanded={isOpen}
        aria-describedby={tooltipId}
      >
        {/* Outer Pulsing Aura Glow */}
        <div className="orb-halo-aura" aria-hidden="true" />

        {/* 3D Orbit Ring Overlays */}
        <div className="orb-cyber-ring ring-primary" aria-hidden="true" />
        <div className="orb-cyber-ring ring-secondary" aria-hidden="true" />

        {/* Radar Scan Sweep Line */}
        <div className="orb-scan-arc" aria-hidden="true" />

        {/* Real-time 3D Canvas Molecular Simulation */}
        <canvas ref={canvasRef} className="orb-3d-canvas" aria-hidden="true" />

        {/* Energy Ripple on Click / Activation */}
        {rippleActive && <span className="orb-click-ripple" aria-hidden="true" />}

        {/* Status Indicator Pip */}
        <span className={`orb-status-pip ${agentState}`} aria-hidden="true">
          <span className="pip-core" />
        </span>
      </button>

      {/* Floating Hover Tooltip */}
      {!isOpen && (
        <div id={tooltipId} className={`bipasha-orb-tooltip ${isHovered ? 'visible' : ''}`} role="tooltip">
          <div className="tooltip-badge">
            <span className="tooltip-dot" />
            <span>AI AGENT</span>
          </div>
          <strong>Ask Bipasha Mam</strong>
          <small>AI Drug Discovery Assistant</small>
        </div>
      )}
    </div>
  )
}
