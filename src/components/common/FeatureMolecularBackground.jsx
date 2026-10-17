import { useEffect, useRef } from 'react'

export default function FeatureMolecularBackground({ activePage = 'biostructure' }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    let animId
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0

    const resize = () => {
      width = container.clientWidth || window.innerWidth
      height = container.clientHeight || window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Pointer parallax tracking
    let targetMouseX = 0
    let targetMouseY = 0
    let currentMouseX = 0
    let currentMouseY = 0

    // Interactive click ripples
    const ripples = []

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2
    }

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect()
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.4,
        alpha: 0.35,
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('click', handleClick, { passive: true })

    // Molecular Orbs inspired by Bipasha Mam AI Logo Animation
    // Each cluster has 3D inclined orbital rings, atoms/nodes, bonds, and central volumetric core
    const clusters = [
      {
        relX: 0.78, // Upper right dominant complex
        relY: 0.30,
        coreRadius: 36,
        orbitRadius: 78,
        rotSpeedY: 0.014,
        rotSpeedX: 0.007,
        angleX: 0.35,
        angleY: 0.4,
        pulsePhase: 0,
        // Orbital nodes (inclined 3D rings like Bipasha Mam AI logo)
        nodes: [
          // Ring A (inclined 35 deg)
          { r: 76, theta: 0, phi: 0.62, size: 4.8, color: '#10b981', label: 'N1' },
          { r: 76, theta: Math.PI * 0.5, phi: 0.62, size: 4.0, color: '#34d399', label: 'C2' },
          { r: 76, theta: Math.PI, phi: 0.62, size: 5.2, color: '#ef5a47', label: 'O3' },
          { r: 76, theta: Math.PI * 1.5, phi: 0.62, size: 3.8, color: '#f97316', label: 'C4' },
          // Ring B (inclined -42 deg)
          { r: 68, theta: Math.PI * 0.25, phi: -0.72, size: 4.2, color: '#38bdf8', label: 'P5' },
          { r: 68, theta: Math.PI * 0.75, phi: -0.72, size: 3.6, color: '#10b981', label: 'C6' },
          { r: 68, theta: Math.PI * 1.25, phi: -0.72, size: 4.6, color: '#fef08a', label: 'S7' },
          { r: 68, theta: Math.PI * 1.75, phi: -0.72, size: 3.4, color: '#6ee7b7', label: 'C8' },
          // Valence particles
          { r: 52, theta: 1.1, phi: 1.15, size: 3.2, color: '#f97316' },
          { r: 88, theta: 3.2, phi: -0.25, size: 3.0, color: '#34d399' },
          { r: 58, theta: 4.6, phi: 0.95, size: 3.5, color: '#ef5a47' },
        ],
        bonds: [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [2, 6], [8, 0], [10, 2], [9, 5],
        ],
        sparkT: 0,
        sparkBondIdx: 0,
      },
      {
        relX: 0.18, // Lower left complementary complex
        relY: 0.72,
        coreRadius: 28,
        orbitRadius: 58,
        rotSpeedY: -0.012,
        rotSpeedX: 0.006,
        angleX: -0.3,
        angleY: 1.2,
        pulsePhase: Math.PI * 0.6,
        nodes: [
          // Ring A
          { r: 56, theta: 0, phi: -0.55, size: 4.2, color: '#ef5a47' },
          { r: 56, theta: Math.PI * 0.66, phi: -0.55, size: 3.6, color: '#10b981' },
          { r: 56, theta: Math.PI * 1.33, phi: -0.55, size: 4.0, color: '#f97316' },
          // Ring B
          { r: 50, theta: Math.PI * 0.33, phi: 0.68, size: 3.8, color: '#34d399' },
          { r: 50, theta: Math.PI, phi: 0.68, size: 3.5, color: '#38bdf8' },
          { r: 50, theta: Math.PI * 1.66, phi: 0.68, size: 4.4, color: '#fef08a' },
          // Valence
          { r: 68, theta: 2.1, phi: 0.1, size: 2.8, color: '#10b981' },
          { r: 44, theta: 4.2, phi: -0.8, size: 3.0, color: '#ef5a47' },
        ],
        bonds: [
          [0, 1], [1, 2], [2, 0],
          [3, 4], [4, 5], [5, 3],
          [0, 3], [1, 4], [2, 5], [6, 1], [7, 0],
        ],
        sparkT: 0,
        sparkBondIdx: 1,
      },
      {
        relX: 0.44, // Satellite top-center complex
        relY: 0.16,
        coreRadius: 20,
        orbitRadius: 42,
        rotSpeedY: 0.016,
        rotSpeedX: -0.008,
        angleX: 0.2,
        angleY: 2.4,
        pulsePhase: Math.PI * 1.2,
        nodes: [
          { r: 42, theta: 0, phi: 0.5, size: 3.4, color: '#10b981' },
          { r: 42, theta: Math.PI * 0.5, phi: 0.5, size: 3.0, color: '#f97316' },
          { r: 42, theta: Math.PI, phi: 0.5, size: 3.6, color: '#34d399' },
          { r: 42, theta: Math.PI * 1.5, phi: 0.5, size: 2.8, color: '#ef5a47' },
          { r: 50, theta: 2.5, phi: -0.4, size: 2.5, color: '#fef08a' },
        ],
        bonds: [
          [0, 1], [1, 2], [2, 3], [3, 0], [4, 1],
        ],
        sparkT: 0,
        sparkBondIdx: 2,
      },
    ]

    // Atmospheric valence particles drifting across the background
    const particleCount = 32
    const ambientParticles = []
    for (let i = 0; i < particleCount; i++) {
      ambientParticles.push({
        x: Math.random() * 1200,
        y: Math.random() * 900,
        size: Math.random() * 2.2 + 1.0,
        velX: (Math.random() - 0.5) * 0.35,
        velY: (Math.random() - 0.5) * 0.3,
        color: i % 4 === 0 ? '#10b981' : i % 4 === 1 ? '#ef5a47' : i % 4 === 2 ? '#f97316' : '#34d399',
        alpha: Math.random() * 0.45 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    let clockTime = 0
    let isTabVisible = true

    const handleVisibility = () => {
      isTabVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const render = () => {
      animId = requestAnimationFrame(render)
      if (!isTabVisible) return

      ctx.clearRect(0, 0, width, height)
      clockTime += 0.016

      // Smooth mouse lerping
      if (!prefersReducedMotion) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.045
        currentMouseY += (targetMouseY - currentMouseY) * 0.045
      }

      // 1. Draw expanding ripples from user clicks
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i]
        rip.radius += 3.5
        rip.alpha -= 0.0055

        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.strokeStyle = `rgba(16, 185, 129, ${rip.alpha * 0.6})`
        ctx.lineWidth = 1.2
        ctx.setLineDash([4, 6])
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // 2. Inter-cluster bio-coordination network lines
      const c1X = width * clusters[0].relX + currentMouseX * 18
      const c1Y = height * clusters[0].relY + currentMouseY * 14
      const c2X = width * clusters[1].relX + currentMouseX * 14
      const c2Y = height * clusters[1].relY + currentMouseY * 10
      const c3X = width * clusters[2].relX + currentMouseX * 12
      const c3Y = height * clusters[2].relY + currentMouseY * 8

      ctx.save()
      ctx.lineWidth = 0.9
      ctx.setLineDash([3, 7])
      ctx.strokeStyle = 'rgba(57, 118, 84, 0.14)'
      ctx.beginPath()
      ctx.moveTo(c1X, c1Y)
      ctx.lineTo(c3X, c3Y)
      ctx.lineTo(c2X, c2Y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // 3. Render each Molecular Complex in Bipasha AI Orb aesthetic
      clusters.forEach((cl, clIdx) => {
        const centerX = width * cl.relX + currentMouseX * (22 - clIdx * 5)
        const centerY = height * cl.relY + currentMouseY * (18 - clIdx * 4)

        if (!prefersReducedMotion) {
          cl.angleY += cl.rotSpeedY
          cl.angleX += cl.rotSpeedX
          cl.pulsePhase += 0.024
        }

        const pulseScale = 1 + Math.sin(cl.pulsePhase) * 0.05
        const curRadius = cl.coreRadius * pulseScale

        // A. Volumetric Glowing Ambient Halo (Bipasha style)
        const glowGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          curRadius * 0.3,
          centerX,
          centerY,
          cl.orbitRadius * 1.55
        )
        if (clIdx === 0) {
          glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)')
          glowGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.10)')
          glowGrad.addColorStop(0.8, 'rgba(239, 90, 71, 0.04)')
          glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)')
        } else if (clIdx === 1) {
          glowGrad.addColorStop(0, 'rgba(239, 90, 71, 0.20)')
          glowGrad.addColorStop(0.45, 'rgba(249, 115, 22, 0.09)')
          glowGrad.addColorStop(1, 'rgba(239, 90, 71, 0)')
        } else {
          glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.18)')
          glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.06)')
          glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)')
        }
        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(centerX, centerY, cl.orbitRadius * 1.55, 0, Math.PI * 2)
        ctx.fill()

        // B. 3D Spherical Perspective Projection of Nodes
        const projectedNodes = cl.nodes.map((node, nIdx) => {
          const currentTheta = node.theta + cl.angleY * (nIdx % 2 === 0 ? 1 : -0.85)
          let x = node.r * Math.cos(currentTheta) * Math.cos(node.phi)
          let y = node.r * Math.sin(node.phi)
          let z = node.r * Math.sin(currentTheta) * Math.cos(node.phi)

          // Rotate X
          const cosX = Math.cos(cl.angleX)
          const sinX = Math.sin(cl.angleX)
          const y1 = y * cosX - z * sinX
          const z1 = y * sinX + z * cosX

          // 3D Perspective Projection
          const focalLength = 130
          const projScale = focalLength / (focalLength + z1)
          const projX = centerX + x * projScale
          const projY = centerY + y1 * projScale

          return {
            projX,
            projY,
            z: z1,
            size: node.size * projScale,
            color: node.color,
            label: node.label,
          }
        })

        // Background vs Foreground nodes for depth
        const bgNodes = projectedNodes.filter((n) => n.z < 0)
        const fgNodes = projectedNodes.filter((n) => n.z >= 0)

        // C. Background Bonds (behind core)
        cl.bonds.forEach(([i, j]) => {
          const p1 = projectedNodes[i]
          const p2 = projectedNodes[j]
          if (!p1 || !p2) return

          if (p1.z < 0 || p2.z < 0) {
            const avgZ = (p1.z + p2.z) / 2
            const alpha = Math.max(0.12, Math.min(0.35, (avgZ + 50) / 100))
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.45})`
            ctx.lineWidth = 0.8
            ctx.setLineDash([2, 3])
            ctx.beginPath()
            ctx.moveTo(p1.projX, p1.projY)
            ctx.lineTo(p2.projX, p2.projY)
            ctx.stroke()
            ctx.setLineDash([])
          }
        })

        // D. Background Nodes
        bgNodes.forEach((node) => {
          const alpha = Math.max(0.2, Math.min(0.65, (node.z + 60) / 100))
          ctx.fillStyle = node.color
          ctx.globalAlpha = alpha * 0.55
          ctx.beginPath()
          ctx.arc(node.projX, node.projY, Math.max(1.2, node.size * 0.85), 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        })

        // E. Central 3D Volumetric Sphere (Bipasha Orb aesthetic)
        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX, centerY, curRadius, 0, Math.PI * 2)
        ctx.clip()

        // 3D Spherical Shading with light source top-left
        const lightX = centerX - curRadius * 0.35
        const lightY = centerY - curRadius * 0.35
        const sphereGrad = ctx.createRadialGradient(lightX, lightY, 2, centerX, centerY, curRadius)

        if (clIdx === 1) {
          // Warm Rust-Amber core
          sphereGrad.addColorStop(0, '#ffffff')
          sphereGrad.addColorStop(0.2, '#fed7aa')
          sphereGrad.addColorStop(0.55, '#f97316')
          sphereGrad.addColorStop(0.85, '#ea580c')
          sphereGrad.addColorStop(1, '#9a3412')
        } else {
          // Emerald Green core (Canonical Bipasha palette)
          sphereGrad.addColorStop(0, '#ffffff')
          sphereGrad.addColorStop(0.2, '#a7f3d0')
          sphereGrad.addColorStop(0.55, '#10b981')
          sphereGrad.addColorStop(0.85, '#059669')
          sphereGrad.addColorStop(1, '#064e3b')
        }

        ctx.fillStyle = sphereGrad
        ctx.fill()

        // Internal Molecular Energy Rings inside the core
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, curRadius * 0.72, curRadius * 0.3, cl.angleY * 0.6, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = clIdx === 1 ? 'rgba(254, 215, 170, 0.45)' : 'rgba(167, 243, 208, 0.45)'
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, curRadius * 0.52, curRadius * 0.22, -cl.angleY * 0.8, 0, Math.PI * 2)
        ctx.stroke()

        // Specular Glass Reflection Crescent
        const specGrad = ctx.createLinearGradient(centerX - curRadius, centerY - curRadius, centerX, centerY)
        specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)')
        specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
        specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = specGrad
        ctx.beginPath()
        ctx.arc(centerX - 2, centerY - 2, curRadius * 0.85, Math.PI, Math.PI * 1.5)
        ctx.lineTo(centerX - 2, centerY - 2)
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // F. Foreground Bonds (in front of core)
        cl.bonds.forEach(([i, j]) => {
          const p1 = projectedNodes[i]
          const p2 = projectedNodes[j]
          if (!p1 || !p2) return

          if (p1.z >= 0 && p2.z >= 0) {
            const avgZ = (p1.z + p2.z) / 2
            const alpha = Math.min(0.65, (avgZ + 40) / 70)
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.65})`
            ctx.lineWidth = 1.1
            ctx.setLineDash([3, 3])
            ctx.beginPath()
            ctx.moveTo(p1.projX, p1.projY)
            ctx.lineTo(p2.projX, p2.projY)
            ctx.stroke()
            ctx.setLineDash([])
          }
        })

        // G. Foreground Nodes with Specular Sparkle
        fgNodes.forEach((node) => {
          const alpha = Math.min(1.0, (node.z + 45) / 75)
          // Node Outer Glow
          ctx.shadowColor = node.color
          ctx.shadowBlur = 8
          ctx.fillStyle = node.color
          ctx.globalAlpha = alpha * 0.95
          ctx.beginPath()
          ctx.arc(node.projX, node.projY, Math.max(1.5, node.size), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          // Central Specular Center Spark
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(node.projX - node.size * 0.25, node.projY - node.size * 0.25, node.size * 0.35, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        })

        // H. Traveling Energy Spark Packets along Bonds (Live Molecular Activity)
        cl.sparkT += 0.02
        if (cl.sparkT >= 1.0) {
          cl.sparkT = 0
          cl.sparkBondIdx = (cl.sparkBondIdx + 1) % cl.bonds.length
        }

        const activeBond = cl.bonds[cl.sparkBondIdx]
        if (activeBond) {
          const n1 = projectedNodes[activeBond[0]]
          const n2 = projectedNodes[activeBond[1]]
          if (n1 && n2) {
            const sparkX = n1.projX + (n2.projX - n1.projX) * cl.sparkT
            const sparkY = n1.projY + (n2.projY - n1.projY) * cl.sparkT

            ctx.shadowColor = '#fef08a'
            ctx.shadowBlur = 10
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(sparkX, sparkY, 2.2, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      })

      // 4. Ambient Drifting Valence Particles (Background Atmosphere)
      ambientParticles.forEach((p) => {
        p.x += p.velX
        p.y += p.velY
        p.pulse += 0.03

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        const pulseAlpha = p.alpha * (0.8 + Math.sin(p.pulse) * 0.2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = pulseAlpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [activePage])

  return (
    <div
      ref={containerRef}
      className="feature-molecular-bg-container"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="feature-molecular-canvas" />
    </div>
  )
}

