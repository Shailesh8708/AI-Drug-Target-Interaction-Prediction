import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export default function CinematicHelixCanvas({ scrollProgress = 0, isMobile = false }) {
  const mountRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const progressRef = useRef(scrollProgress)

  // Keep progressRef updated with latest scroll prop
  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglSupported(false)
      return
    }

    const container = mountRef.current
    if (!container) return

    // Clean previous children if any (Strict Mode resilience)
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || window.innerHeight

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 1000)
    camera.position.set(0, 0, 32)

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    container.appendChild(renderer.domElement)

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1622, 2.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0x00e5ff, 2.6)
    keyLight.position.set(18, 22, 20)
    scene.add(keyLight)

    const violetFill = new THREE.PointLight(0xa78bfa, 2.4, 50)
    violetFill.position.set(-18, -14, 18)
    scene.add(violetFill)

    const iceBlueCounter = new THREE.PointLight(0x38bdf8, 2.0, 45)
    iceBlueCounter.position.set(14, -18, -12)
    scene.add(iceBlueCounter)

    const pulseLight = new THREE.PointLight(0x10b981, 3.2, 30)
    pulseLight.position.set(0, 0, 8)
    scene.add(pulseLight)

    // 4. Helix Geometry Construction
    const helixGroup = new THREE.Group()
    scene.add(helixGroup)

    const numBasePairs = isMobile ? 26 : 38
    const totalTurns = 3.6
    const totalAngle = totalTurns * Math.PI * 2
    const helixHeight = 40
    const helixRadius = isMobile ? 3.8 : 4.4

    const pointsStrandA = []
    const pointsStrandB = []

    for (let i = 0; i < numBasePairs; i++) {
      const t = i / (numBasePairs - 1)
      const theta = t * totalAngle
      const y = (t - 0.5) * helixHeight

      pointsStrandA.push(new THREE.Vector3(
        helixRadius * Math.cos(theta),
        y,
        helixRadius * Math.sin(theta)
      ))

      pointsStrandB.push(new THREE.Vector3(
        helixRadius * Math.cos(theta + Math.PI),
        y,
        helixRadius * Math.sin(theta + Math.PI)
      ))
    }

    // Sugar-phosphate backbone curves
    const curveA = new THREE.CatmullRomCurve3(pointsStrandA)
    const curveB = new THREE.CatmullRomCurve3(pointsStrandB)

    const tubeGeoA = new THREE.TubeGeometry(curveA, numBasePairs * 4, 0.26, 10, false)
    const tubeGeoB = new THREE.TubeGeometry(curveB, numBasePairs * 4, 0.26, 10, false)

    const matStrandA = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0x004455,
      emissiveIntensity: 0.45,
    })

    const matStrandB = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0x075985,
      emissiveIntensity: 0.4,
    })

    const tubeMeshA = new THREE.Mesh(tubeGeoA, matStrandA)
    const tubeMeshB = new THREE.Mesh(tubeGeoB, matStrandB)
    helixGroup.add(tubeMeshA)
    helixGroup.add(tubeMeshB)

    // Reusable geometries
    const nucleotideSphereGeo = new THREE.SphereGeometry(0.42, 12, 12)
    const hydrogenSphereGeo = new THREE.SphereGeometry(0.24, 10, 10)
    const rungCylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, 1, 8)

    // Nucleotide Base Materials (Adenine, Thymine, Guanine, Cytosine)
    const baseMaterials = {
      adenine: new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x005577,
        emissiveIntensity: 0.5,
      }),
      thymine: new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        metalness: 0.75,
        roughness: 0.3,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.45,
      }),
      guanine: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x064e3b,
        emissiveIntensity: 0.55,
      }),
      cytosine: new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x581c87,
        emissiveIntensity: 0.5,
      }),
    }

    const hydrogenBondMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.1,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.95,
    })

    const yUnitVector = new THREE.Vector3(0, 1, 0)
    const basePairMeshes = []

    // Build base-pair rungs and nucleotide spheres
    for (let i = 0; i < numBasePairs; i++) {
      const pA = pointsStrandA[i]
      const pB = pointsStrandB[i]
      const midpoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5)

      // Phosphate / sugar nodes on strand A & B
      const nodeA = new THREE.Mesh(nucleotideSphereGeo, matStrandA)
      nodeA.position.copy(pA)
      helixGroup.add(nodeA)

      const nodeB = new THREE.Mesh(nucleotideSphereGeo, matStrandB)
      nodeB.position.copy(pB)
      helixGroup.add(nodeB)

      // Base pair assignment (A-T, G-C, T-A, C-G sequence cycle)
      const cycle = i % 4
      const [mat1, mat2] = cycle === 0
        ? [baseMaterials.adenine, baseMaterials.thymine]
        : cycle === 1
        ? [baseMaterials.guanine, baseMaterials.cytosine]
        : cycle === 2
        ? [baseMaterials.thymine, baseMaterials.adenine]
        : [baseMaterials.cytosine, baseMaterials.guanine]

      // Half rung 1: from pA to midpoint
      const dir1 = new THREE.Vector3().subVectors(midpoint, pA)
      const len1 = dir1.length()
      const half1Mid = new THREE.Vector3().addVectors(pA, midpoint).multiplyScalar(0.5)

      const rungMesh1 = new THREE.Mesh(rungCylinderGeo, mat1)
      rungMesh1.scale.set(1, len1, 1)
      rungMesh1.position.copy(half1Mid)
      rungMesh1.quaternion.setFromUnitVectors(yUnitVector, dir1.clone().normalize())
      helixGroup.add(rungMesh1)

      // Half rung 2: from midpoint to pB
      const dir2 = new THREE.Vector3().subVectors(pB, midpoint)
      const len2 = dir2.length()
      const half2Mid = new THREE.Vector3().addVectors(midpoint, pB).multiplyScalar(0.5)

      const rungMesh2 = new THREE.Mesh(rungCylinderGeo, mat2)
      rungMesh2.scale.set(1, len2, 1)
      rungMesh2.position.copy(half2Mid)
      rungMesh2.quaternion.setFromUnitVectors(yUnitVector, dir2.clone().normalize())
      helixGroup.add(rungMesh2)

      // Hydrogen bond spark node at center
      const hNode = new THREE.Mesh(hydrogenSphereGeo, hydrogenBondMat)
      hNode.position.copy(midpoint)
      helixGroup.add(hNode)

      basePairMeshes.push({ hNode, rungMesh1, rungMesh2, index: i })
    }

    // 5. Small-Molecule Ligand Complex (Section C - DTI Intelligence interaction)
    const ligandGroup = new THREE.Group()
    const ligandAtomGeo = new THREE.SphereGeometry(0.32, 10, 10)
    const ligandBondGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 6)
    const ligandAtomMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    })
    const ligandNitrogenMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
    })
    const ligandBondMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.6,
      roughness: 0.3,
    })

    // Local coordinates for an aromatic heterocycle + carboxamide branch (Imatinib-like pharmacophore)
    const ligandAtoms = [
      { pos: new THREE.Vector3(0, 0, 0), mat: ligandAtomMat },
      { pos: new THREE.Vector3(0.9, 0.5, 0), mat: ligandAtomMat },
      { pos: new THREE.Vector3(0.9, 1.5, 0), mat: ligandNitrogenMat },
      { pos: new THREE.Vector3(0, 2.0, 0), mat: ligandAtomMat },
      { pos: new THREE.Vector3(-0.9, 1.5, 0), mat: ligandAtomMat },
      { pos: new THREE.Vector3(-0.9, 0.5, 0), mat: ligandNitrogenMat },
      { pos: new THREE.Vector3(1.8, 2.1, 0.4), mat: ligandAtomMat },
      { pos: new THREE.Vector3(2.6, 1.7, 0.8), mat: ligandNitrogenMat },
    ]

    const ligandBonds = [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [2, 6], [6, 7]
    ]

    ligandAtoms.forEach(({ pos, mat }) => {
      const atomMesh = new THREE.Mesh(ligandAtomGeo, mat)
      atomMesh.position.copy(pos)
      ligandGroup.add(atomMesh)
    })

    ligandBonds.forEach(([idxA, idxB]) => {
      const p1 = ligandAtoms[idxA].pos
      const p2 = ligandAtoms[idxB].pos
      const dir = new THREE.Vector3().subVectors(p2, p1)
      const len = dir.length()
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)

      const bondMesh = new THREE.Mesh(ligandBondGeo, ligandBondMat)
      bondMesh.scale.set(1, len, 1)
      bondMesh.position.copy(mid)
      bondMesh.quaternion.setFromUnitVectors(yUnitVector, dir.clone().normalize())
      ligandGroup.add(bondMesh)
    })

    // Place ligand in major groove binding cleft
    ligandGroup.position.set(5.2, 1.8, 2.5)
    helixGroup.add(ligandGroup)

    // Interaction vector line from ligand to helix pocket
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x00e5ff,
      dashSize: 0.3,
      gapSize: 0.2,
      linewidth: 1.5,
    })
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(5.2, 1.8, 2.5),
      new THREE.Vector3(3.8, 1.2, 1.4),
    ])
    const interactionLine = new THREE.Line(lineGeo, lineMat)
    interactionLine.computeLineDistances()
    helixGroup.add(interactionLine)

    // 6. Atmospheric Floating Particle Field
    const particleCount = isMobile ? 120 : 260
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleVels = []

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 50
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40

      particleVels.push({
        yVel: (Math.random() * 0.015 + 0.005),
        xDrift: (Math.random() - 0.5) * 0.004,
        phase: Math.random() * Math.PI * 2,
      })
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.35 : 0.42,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    })
    const particleCloud = new THREE.Points(particleGeo, particleMat)
    scene.add(particleCloud)

    // 7. Pointer Parallax Tracking
    let targetMouseX = 0
    let targetMouseY = 0
    let currentMouseX = 0
    let currentMouseY = 0

    const handlePointerMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handlePointerMove, { passive: true })

    // 8. Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return
      width = mountRef.current.clientWidth || window.innerWidth
      height = mountRef.current.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // 9. Camera Spline Milestones for Scroll-driven Pacing
    const milestones = [
      { p: 0.00, cam: new THREE.Vector3(0, 0, 32), look: new THREE.Vector3(0, 0, 0) },
      { p: 0.28, cam: new THREE.Vector3(5.6, 2.4, 21), look: new THREE.Vector3(0.6, 1.2, 0) },
      { p: 0.55, cam: new THREE.Vector3(-4.6, -1.0, 18), look: new THREE.Vector3(1.4, -0.6, 0) },
      { p: 0.78, cam: new THREE.Vector3(0, -1.8, 28), look: new THREE.Vector3(0, -1.0, 0) },
      { p: 1.00, cam: new THREE.Vector3(0, 4.0, 34), look: new THREE.Vector3(0, 0, 0) },
    ]

    function getInterpolatedCam(progress) {
      const p = Math.max(0, Math.min(1, progress))
      let idx = 0
      for (let i = 0; i < milestones.length - 1; i++) {
        if (p >= milestones[i].p && p <= milestones[i + 1].p) {
          idx = i
          break
        }
      }
      const m1 = milestones[idx]
      const m2 = milestones[idx + 1]
      const span = m2.p - m1.p || 1
      const localT = (p - m1.p) / span
      // Smooth cosine easing
      const easedT = 0.5 - 0.5 * Math.cos(localT * Math.PI)

      return {
        pos: new THREE.Vector3().lerpVectors(m1.cam, m2.cam, easedT),
        look: new THREE.Vector3().lerpVectors(m1.look, m2.look, easedT),
      }
    }

    // 10. Animation Render Loop
    let animId
    let clock = new THREE.Clock()
    let currentCamPos = new THREE.Vector3(0, 0, 32)
    let currentLookAt = new THREE.Vector3(0, 0, 0)
    let baseRotation = 0

    const render = () => {
      animId = requestAnimationFrame(render)
      const delta = clock.getDelta()
      const time = clock.getElapsedTime()

      // Pointer lerp
      if (!prefersReducedMotion) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.05
        currentMouseY += (targetMouseY - currentMouseY) * 0.05
      }

      const p = progressRef.current
      const { pos: targetCamPos, look: targetLookAt } = getInterpolatedCam(p)

      if (!prefersReducedMotion) {
        // Subtle continuous spin + scroll-driven rotation
        baseRotation += delta * 0.35
        const scrollRotation = p * Math.PI * 3.4
        helixGroup.rotation.y = baseRotation + scrollRotation

        // Tilt responding gently to scroll and pointer
        helixGroup.rotation.z = Math.sin(p * Math.PI) * 0.16 + 0.1 + currentMouseX * 0.06
        helixGroup.rotation.x = currentMouseY * 0.08

        // Lerp camera position
        const parallaxX = currentMouseX * 1.8
        const parallaxY = -currentMouseY * 1.5

        currentCamPos.lerp(
          new THREE.Vector3(targetCamPos.x + parallaxX, targetCamPos.y + parallaxY, targetCamPos.z),
          0.06
        )
        currentLookAt.lerp(targetLookAt, 0.06)
        camera.position.copy(currentCamPos)
        camera.lookAt(currentLookAt)
      } else {
        camera.position.set(0, 0, 32)
        camera.lookAt(0, 0, 0)
        helixGroup.rotation.y += delta * 0.1
      }

      // Traveling volumetric pulse light
      pulseLight.position.y = Math.sin(time * 1.8 + p * 8) * 16

      // Base-pair pulse glow
      const activePulseIndex = Math.floor(((Math.sin(time * 2.2) + 1) / 2) * numBasePairs)
      basePairMeshes.forEach(({ hNode, index }) => {
        const isNear = Math.abs(index - activePulseIndex) <= 2
        hNode.scale.setScalar(isNear ? 1.45 : 1.0)
      })

      // Ligand bobbing motion in binding cleft
      ligandGroup.position.y = 1.8 + Math.sin(time * 2.0) * 0.18
      ligandGroup.rotation.y = time * 0.4

      // Particle cloud turbulence
      const posAttr = particleGeo.attributes.position
      for (let i = 0; i < particleCount; i++) {
        const v = particleVels[i]
        let py = posAttr.getY(i) - v.yVel
        let px = posAttr.getX(i) + Math.sin(time + v.phase) * v.xDrift

        if (py < -25) py = 25
        posAttr.setY(i, py)
        posAttr.setX(i, px)
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    render()

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('resize', handleResize)

      // Geometry disposal
      tubeGeoA.dispose()
      tubeGeoB.dispose()
      nucleotideSphereGeo.dispose()
      hydrogenSphereGeo.dispose()
      rungCylinderGeo.dispose()
      ligandAtomGeo.dispose()
      ligandBondGeo.dispose()
      particleGeo.dispose()
      lineGeo.dispose()

      // Material disposal
      matStrandA.dispose()
      matStrandB.dispose()
      Object.values(baseMaterials).forEach((m) => m.dispose())
      hydrogenBondMat.dispose()
      ligandAtomMat.dispose()
      ligandNitrogenMat.dispose()
      ligandBondMat.dispose()
      particleMat.dispose()
      lineMat.dispose()

      renderer.dispose()
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [isMobile])

  if (!webglSupported) {
    return <HelixFallbackScene />
  }

  return (
    <div
      ref={mountRef}
      className="cinematic-helix-canvas-container"
      aria-label="3D Interactive DNA Double Helix Visualization"
      role="img"
    />
  )
}

function HelixFallbackScene() {
  return (
    <div className="helix-fallback-scene" aria-label="Decorative Double Helix Diagram">
      <div className="fallback-grid" />
      <div className="fallback-glow" />
      <svg viewBox="0 0 400 800" className="fallback-helix-svg" aria-hidden="true">
        <defs>
          <linearGradient id="strandGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="strandGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 40 + i * 30
          const phase = (i / 24) * Math.PI * 4
          const x1 = 200 + Math.cos(phase) * 90
          const x2 = 200 + Math.cos(phase + Math.PI) * 90
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(0, 229, 255, 0.35)" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx={x1} cy={y} r="5" fill="#00e5ff" />
              <circle cx={x2} cy={y} r="5" fill="#a855f7" />
              <circle cx={(x1 + x2) / 2} cy={y} r="3" fill="#ffffff" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

