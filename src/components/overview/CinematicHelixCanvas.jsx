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

export default function CinematicHelixCanvas({
  scrollProgress = 0,
  isMobile = false,
  viewMode = 'cinematic',
  isAutoSpin = true,
  onTelemetry = null,
}) {
  const mountRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const progressRef = useRef(scrollProgress)
  const viewModeRef = useRef(viewMode)
  const autoSpinRef = useRef(isAutoSpin)
  const onTelemetryRef = useRef(onTelemetry)

  // Keep refs synchronized with props
  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])

  useEffect(() => {
    autoSpinRef.current = isAutoSpin
  }, [isAutoSpin])

  useEffect(() => {
    onTelemetryRef.current = onTelemetry
  }, [onTelemetry])

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

    // 2. High-Fidelity WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.appendChild(renderer.domElement)

    // 3. Lighting Harmony: Rust Red, Warm Ember, and Emerald Green
    const ambientLight = new THREE.AmbientLight(0x07110e, 2.6)
    scene.add(ambientLight)

    // Key Light: Warm Rust-Red / Ember Directional Light
    const keyLight = new THREE.DirectionalLight(0xff6b4a, 2.8)
    keyLight.position.set(18, 22, 20)
    scene.add(keyLight)

    // Fill Light: Lush Emerald Green Point Light
    const emeraldFill = new THREE.PointLight(0x10b981, 2.6, 52)
    emeraldFill.position.set(-18, -14, 18)
    scene.add(emeraldFill)

    // Counter Light: Warm Terracotta / Rust-Copper Accent
    const rustCounter = new THREE.PointLight(0xea580c, 2.2, 45)
    rustCounter.position.set(16, -18, -12)
    scene.add(rustCounter)

    // Traveling Volumetric Wave Light: Bio-Green / Emerald
    const pulseLight = new THREE.PointLight(0x22c55e, 3.4, 32)
    pulseLight.position.set(0, 0, 8)
    scene.add(pulseLight)

    // 4. Helix Duplex Geometry Construction
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

    const tubeGeoA = new THREE.TubeGeometry(curveA, numBasePairs * 4, 0.28, 10, false)
    const tubeGeoB = new THREE.TubeGeometry(curveB, numBasePairs * 4, 0.28, 10, false)

    // Strand A Material: Metallic Rust Red / Crimson
    const matStrandA = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.65,
    })

    // Strand B Material: Metallic Bio-Green / Emerald
    const matStrandB = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0x064e3b,
      emissiveIntensity: 0.65,
    })

    const tubeMeshA = new THREE.Mesh(tubeGeoA, matStrandA)
    const tubeMeshB = new THREE.Mesh(tubeGeoB, matStrandB)
    helixGroup.add(tubeMeshA)
    helixGroup.add(tubeMeshB)

    // Reusable geometries
    const nucleotideSphereGeo = new THREE.SphereGeometry(0.44, 12, 12)
    const hydrogenSphereGeo = new THREE.SphereGeometry(0.26, 10, 10)
    const rungCylinderGeo = new THREE.CylinderGeometry(0.13, 0.13, 1, 8)

    // Nucleotide Base Materials (Adenine, Thymine, Guanine, Cytosine in Rust Red & Green Harmony)
    const baseMaterials = {
      adenine: new THREE.MeshStandardMaterial({
        color: 0xef4444, // Vibrant Rust Red
        metalness: 0.82,
        roughness: 0.22,
        emissive: 0x991b1b,
        emissiveIntensity: 0.6,
      }),
      thymine: new THREE.MeshStandardMaterial({
        color: 0x10b981, // Luminous Emerald Green
        metalness: 0.82,
        roughness: 0.22,
        emissive: 0x064e3b,
        emissiveIntensity: 0.6,
      }),
      guanine: new THREE.MeshStandardMaterial({
        color: 0xf97316, // Warm Rust Amber / Copper
        metalness: 0.82,
        roughness: 0.22,
        emissive: 0x9a3412,
        emissiveIntensity: 0.6,
      }),
      cytosine: new THREE.MeshStandardMaterial({
        color: 0x34d399, // Bright Mint / Jade Green
        metalness: 0.82,
        roughness: 0.22,
        emissive: 0x047857,
        emissiveIntensity: 0.6,
      }),
    }

    // Hydrogen bond nodule: Center energetic spark linking rust red & green rungs
    const hydrogenBondMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      metalness: 0.2,
      roughness: 0.1,
      emissive: 0x10b981,
      emissiveIntensity: 1.2,
    })

    const yUnitVector = new THREE.Vector3(0, 1, 0)
    const basePairMeshes = []
    const baseNames = ['A-T (Adenine · Thymine)', 'G-C (Guanine · Cytosine)', 'T-A (Thymine · Adenine)', 'C-G (Cytosine · Guanine)']

    // Build base-pair rungs and nucleotide spheres
    for (let i = 0; i < numBasePairs; i++) {
      const pA = pointsStrandA[i]
      const pB = pointsStrandB[i]
      const midpoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5)

      // Phosphate / sugar nodes on strand A (Rust) & strand B (Emerald)
      const nodeA = new THREE.Mesh(nucleotideSphereGeo, matStrandA)
      nodeA.position.copy(pA)
      helixGroup.add(nodeA)

      const nodeB = new THREE.Mesh(nucleotideSphereGeo, matStrandB)
      nodeB.position.copy(pB)
      helixGroup.add(nodeB)

      // Canonical complementary base pair cycle (A-T, G-C, T-A, C-G)
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

      basePairMeshes.push({
        hNode,
        rungMesh1,
        rungMesh2,
        nodeA,
        nodeB,
        index: i,
        name: baseNames[cycle],
        baseY: midpoint.y,
        origA: pA.clone(),
        origB: pB.clone(),
      })
    }

    // 5. Small-Molecule Ligand Complex (Section C - DTI Intelligence interaction)
    const ligandGroup = new THREE.Group()
    const ligandAtomGeo = new THREE.SphereGeometry(0.34, 10, 10)
    const ligandBondGeo = new THREE.CylinderGeometry(0.09, 0.09, 1, 6)

    // Ligand atoms styled in rust amber & emerald green
    const ligandAtomMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Rust Amber
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x9a3412,
      emissiveIntensity: 0.7,
    })
    const ligandNitrogenMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald Green
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x059669,
      emissiveIntensity: 0.75,
    })
    const ligandBondMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Rust Bronze
      metalness: 0.65,
      roughness: 0.3,
    })

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

    // Interaction vector line from ligand to helix pocket: Emerald dashed glow
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x34d399,
      dashSize: 0.3,
      gapSize: 0.2,
      linewidth: 1.8,
    })
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(5.2, 1.8, 2.5),
      new THREE.Vector3(3.8, 1.2, 1.4),
    ])
    const interactionLine = new THREE.Line(lineGeo, lineMat)
    interactionLine.computeLineDistances()
    helixGroup.add(interactionLine)

    // 6. Atmospheric Dual-Tone Floating Particle Field (Rust Red & Emerald Green)
    const particleCount = isMobile ? 140 : 280
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)
    const particleVels = []

    // Color tones: Rust Red/Amber (#f97316 / #ef4444) and Emerald Green (#10b981 / #34d399)
    const rustColor = new THREE.Color(0xf97316)
    const greenColor = new THREE.Color(0x10b981)
    const mintColor = new THREE.Color(0x34d399)
    const amberColor = new THREE.Color(0xef4444)

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 65
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 55
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 45

      const c = i % 4 === 0 ? rustColor : i % 4 === 1 ? greenColor : i % 4 === 2 ? mintColor : amberColor
      particleColors[i * 3] = c.r
      particleColors[i * 3 + 1] = c.g
      particleColors[i * 3 + 2] = c.b

      particleVels.push({
        yVel: (Math.random() * 0.016 + 0.006),
        xDrift: (Math.random() - 0.5) * 0.005,
        zDrift: (Math.random() - 0.5) * 0.004,
        phase: Math.random() * Math.PI * 2,
      })
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.38 : 0.46,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
    })
    const particleCloud = new THREE.Points(particleGeo, particleMat)
    scene.add(particleCloud)

    // 7. Interactive Pointer & Drag Rotation Tracking
    let targetMouseX = 0
    let targetMouseY = 0
    let currentMouseX = 0
    let currentMouseY = 0

    let isPointerDragging = false
    let prevDragX = 0
    let prevDragY = 0
    let dragRotY = 0
    let dragRotX = 0
    let dragVelY = 0
    let dragVelX = 0

    const handlePointerMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2

      if (isPointerDragging) {
        const deltaX = e.clientX - prevDragX
        const deltaY = e.clientY - prevDragY
        prevDragX = e.clientX
        prevDragY = e.clientY

        dragVelY = deltaX * 0.006
        dragVelX = deltaY * 0.006
        dragRotY += dragVelY
        dragRotX += dragVelX
      }
    }

    const handlePointerDown = (e) => {
      // Allow drag rotation anywhere on interactive backdrop
      isPointerDragging = true
      prevDragX = e.clientX
      prevDragY = e.clientY
    }

    const handlePointerUp = () => {
      isPointerDragging = false
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('mouseup', handlePointerUp)

    // Touch support for mobile dragging
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isPointerDragging = true
        prevDragX = e.touches[0].clientX
        prevDragY = e.touches[0].clientY
      }
    }
    const handleTouchMove = (e) => {
      if (isPointerDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevDragX
        const deltaY = e.touches[0].clientY - prevDragY
        prevDragX = e.touches[0].clientX
        prevDragY = e.touches[0].clientY

        dragVelY = deltaX * 0.007
        dragVelX = deltaY * 0.007
        dragRotY += dragVelY
        dragRotX += dragVelX
      }
    }
    const handleTouchEnd = () => {
      isPointerDragging = false
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

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

    // 9. Camera Spline Milestones for Scroll-driven Pacing (Canonical preservation)
    const milestones = [
      { p: 0.00, cam: new THREE.Vector3(0, 0, 32), look: new THREE.Vector3(0, 0, 0) },
      { p: 0.28, cam: new THREE.Vector3(5.6, 2.4, 21), look: new THREE.Vector3(0.6, 1.2, 0) },
      { p: 0.55, cam: new THREE.Vector3(-4.6, -1.0, 18), look: new THREE.Vector3(1.4, -0.6, 0) },
      { p: 0.78, cam: new THREE.Vector3(0, -1.8, 28), look: new THREE.Vector3(0, -1.0, 0) },
      { p: 1.00, cam: new THREE.Vector3(0, 4.0, 34), look: new THREE.Vector3(0, 0, 0) },
    ]

    // Specialized Interactive View Targets
    const viewTargets = {
      cinematic: null, // calculated from scroll progress
      duplex: { cam: new THREE.Vector3(3.4, 1.2, 14), look: new THREE.Vector3(0, 0.8, 0) },
      ligand: { cam: new THREE.Vector3(7.2, 2.6, 10.5), look: new THREE.Vector3(5.2, 1.8, 2.5) },
      axial: { cam: new THREE.Vector3(0.01, 38, 0.01), look: new THREE.Vector3(0, 0, 0) },
    }

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

    // 10. Animation Render Loop with Delta-Timed Damping
    let animId
    let clock = new THREE.Clock()
    let currentCamPos = new THREE.Vector3(0, 0, 32)
    let currentLookAt = new THREE.Vector3(0, 0, 0)
    let baseRotation = 0
    let lastTelemetryTime = 0

    const render = () => {
      animId = requestAnimationFrame(render)
      const delta = Math.min(clock.getDelta(), 0.1) // clamp delta to prevent jumps
      const time = clock.getElapsedTime()

      // Delta-timed exponential damping for silky pointer tracking
      const mouseDampFactor = 1 - Math.exp(-6.0 * delta)
      if (!prefersReducedMotion) {
        currentMouseX += (targetMouseX - currentMouseX) * mouseDampFactor
        currentMouseY += (targetMouseY - currentMouseY) * mouseDampFactor
      }

      // Decay drag velocity smoothly with momentum
      if (!isPointerDragging) {
        dragVelY *= Math.max(0, 1 - 4.0 * delta)
        dragVelX *= Math.max(0, 1 - 4.0 * delta)
        dragRotY += dragVelY
        dragRotX += dragVelX
      }

      const p = progressRef.current
      const activeMode = viewModeRef.current || 'cinematic'

      let targetCamPos
      let targetLookAt

      if (activeMode !== 'cinematic' && viewTargets[activeMode]) {
        targetCamPos = viewTargets[activeMode].cam
        targetLookAt = viewTargets[activeMode].look
      } else {
        const milestoneCam = getInterpolatedCam(p)
        targetCamPos = milestoneCam.pos
        targetLookAt = milestoneCam.look
      }

      if (!prefersReducedMotion) {
        // Continuous organic rotation if auto-spin is enabled
        if (autoSpinRef.current) {
          baseRotation += delta * 0.38
        }

        const scrollRotation = p * Math.PI * 3.4
        helixGroup.rotation.y = baseRotation + scrollRotation + dragRotY

        // Harmonic organic tilt responding to scroll, user drag, and pointer
        helixGroup.rotation.z = Math.sin(p * Math.PI) * 0.16 + 0.1 + currentMouseX * 0.06 + Math.sin(time * 0.8) * 0.02
        helixGroup.rotation.x = currentMouseY * 0.08 + dragRotX

        // Gentle camera parallax
        const parallaxX = currentMouseX * 1.6
        const parallaxY = -currentMouseY * 1.4

        const desiredCam = new THREE.Vector3(
          targetCamPos.x + parallaxX,
          targetCamPos.y + parallaxY,
          targetCamPos.z
        )

        // Delta-timed exponential smoothing for fluid camera motion across 60/120/144Hz
        const camLerpAlpha = 1 - Math.exp(-4.8 * delta)
        currentCamPos.lerp(desiredCam, camLerpAlpha)
        currentLookAt.lerp(targetLookAt, camLerpAlpha)

        camera.position.copy(currentCamPos)
        camera.lookAt(currentLookAt)
      } else {
        camera.position.set(0, 0, 32)
        camera.lookAt(0, 0, 0)
        helixGroup.rotation.y += delta * 0.1
      }

      // Traveling volumetric wave light: Emerald / Green glow oscillation
      pulseLight.position.y = Math.sin(time * 1.8 + p * 8) * 16
      pulseLight.position.x = Math.cos(time * 1.4) * 4

      // Base-pair continuous excitation wave & harmonic breathing
      const waveCenter = ((Math.sin(time * 2.0) + 1) / 2) * (numBasePairs - 1)
      let nearestIndex = Math.round(waveCenter)

      basePairMeshes.forEach(({ hNode, rungMesh1, rungMesh2, index }) => {
        const dist = Math.abs(index - waveCenter)
        // Organic falloff wave
        const waveIntensity = Math.max(0, 1 - dist / 3.2)
        const scale = 1.0 + waveIntensity * 0.65
        hNode.scale.setScalar(scale)

        // Subtle harmonic vibration on base-pair rungs
        const breathing = Math.sin(time * 2.5 + index * 0.3) * 0.03
        rungMesh1.scale.x = 1 + breathing
        rungMesh2.scale.x = 1 + breathing
      })

      // Ligand bobbing and energetic rotation in binding cleft
      ligandGroup.position.y = 1.8 + Math.sin(time * 2.2) * 0.22
      ligandGroup.rotation.y = time * 0.45
      ligandGroup.rotation.z = Math.sin(time * 1.6) * 0.12

      // Atmospheric Particle Cloud Turbulence
      const posAttr = particleGeo.attributes.position
      for (let i = 0; i < particleCount; i++) {
        const v = particleVels[i]
        let py = posAttr.getY(i) - v.yVel
        let px = posAttr.getX(i) + Math.sin(time + v.phase) * v.xDrift
        let pz = posAttr.getZ(i) + Math.cos(time + v.phase) * v.zDrift

        if (py < -28) py = 28
        posAttr.setY(i, py)
        posAttr.setX(i, px)
        posAttr.setZ(i, pz)
      }
      posAttr.needsUpdate = true

      // Send live telemetry to parent component (throttled to ~100ms)
      if (onTelemetryRef.current && time - lastTelemetryTime > 0.1) {
        lastTelemetryTime = time
        const rawAzimuth = ((helixGroup.rotation.y % (Math.PI * 2)) * 180 / Math.PI + 360) % 360
        const camDistance = camera.position.distanceTo(currentLookAt)
        const activeBpInfo = basePairMeshes[nearestIndex % numBasePairs]?.name || 'A-T'

        onTelemetryRef.current({
          azimuth: rawAzimuth.toFixed(1),
          distance: camDistance.toFixed(1),
          activeBp: activeBpInfo,
          waveIndex: nearestIndex + 1,
        })
      }

      renderer.render(scene, camera)
    }

    render()

    // 11. Cleanup with Strict Disposal
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
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
      aria-label="3D Interactive DNA Double Helix Visualization in Rust Red and Emerald Green"
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
            <stop offset="0%" stopColor="#ef5a47" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="strandGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 40 + i * 30
          const phase = (i / 24) * Math.PI * 4
          const x1 = 200 + Math.cos(phase) * 90
          const x2 = 200 + Math.cos(phase + Math.PI) * 90
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(239, 90, 71, 0.35)" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx={x1} cy={y} r="5" fill="#ef5a47" />
              <circle cx={x2} cy={y} r="5" fill="#10b981" />
              <circle cx={(x1 + x2) / 2} cy={y} r="3" fill="#ffedd5" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
