import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import {
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  AlertCircle,
  RefreshCw,
  Box,
} from 'lucide-react'

const CHAIN_PALETTE = [
  '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#14b8a6', '#f97316', '#a855f7', '#6366f1',
]

const ELEMENT_COLORS = {
  C: '#94a3b8',
  N: '#38bdf8',
  O: '#ef4444',
  S: '#eab308',
  P: '#f97316',
  F: '#22c55e',
  CL: '#10b981',
  BR: '#b91c1c',
  I: '#7e22ce',
  H: '#f8fafc',
  MN: '#a855f7',
  MG: '#10b981',
  ZN: '#64748b',
  CA: '#0284c7',
  FE: '#ea580c',
}

/**
 * Safely dispose all geometries, materials, and children in a Three.js hierarchy.
 */
function disposeHierarchy(node) {
  if (!node) return
  while (node.children && node.children.length > 0) {
    const child = node.children[0]
    disposeHierarchy(child)
    node.remove(child)
  }
  if (node.geometry) {
    try {
      node.geometry.dispose()
    } catch {}
  }
  if (node.material) {
    try {
      if (Array.isArray(node.material)) {
        node.material.forEach((m) => m?.dispose?.())
      } else {
        node.material.dispose?.()
      }
    } catch {}
  }
}

/**
 * Check if WebGL context can be created in the current environment.
 */
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

export default function BioStructure3DViewer({
  structure,
  representation = 'cartoon',
  selectedResidueId = null,
  selectedLigandId = null,
  highlightedResidues = null,
  pocketData = null,
  showPocket = false,
  showInteractions = true,
  cameraPreset = 'full',
  autoSpin = false,
  onSelectResidue = () => {},
  onSelectLigand = () => {},
}) {
  const hostRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const engineRef = useRef(null)
  const metricsRef = useRef({ cx: 0, cy: 0, cz: 0, maxRadius: 30, center: new THREE.Vector3(), visibleAtoms: [] })
  const interactiveDataRef = useRef({ pointsMesh: null, atoms: [] })
  const animFrameIdRef = useRef(null)
  const autoSpinRef = useRef(autoSpin)

  useEffect(() => {
    autoSpinRef.current = autoSpin
  }, [autoSpin])

  const onSelectResidueRef = useRef(onSelectResidue)
  const onSelectLigandRef = useRef(onSelectLigand)
  useEffect(() => {
    onSelectResidueRef.current = onSelectResidue
    onSelectLigandRef.current = onSelectLigand
  }, [onSelectResidue, onSelectLigand])

  const [hasWebglError, setHasWebglError] = useState(false)
  const [isContextLost, setIsContextLost] = useState(false)
  const [rebuildTrigger, setRebuildTrigger] = useState(0)

  const [hoveredInfo, setHoveredInfo] = useState(null)
  const [activePreset, setActivePreset] = useState(cameraPreset)

  // Visibility toggles
  const [showProtein, setShowProtein] = useState(true)
  const [showDna, setShowDna] = useState(true)
  const [showLigands, setShowLigands] = useState(true)
  const [showMetals, setShowMetals] = useState(true)
  const [showWater, setShowWater] = useState(false)

  // Pocket residue lookup
  const pocketResidueSet = useMemo(() => {
    if (!showPocket || !pocketData?.pocketResidues) return new Set()
    return new Set(pocketData.pocketResidues.map((r) => r.residueId))
  }, [showPocket, pocketData])

  // Camera presets handler
  const handlePreset = useCallback((preset) => {
    setActivePreset(preset)
    const engine = engineRef.current
    if (!engine) return

    const { rootGroup, camera } = engine
    const { cx, cy, cz, maxRadius, visibleAtoms } = metricsRef.current
    if (!visibleAtoms || !visibleAtoms.length) return

    if (preset === 'full') {
      rootGroup.rotation.set(0, 0, 0)
      camera.position.set(0, 0, maxRadius * 2.2)
      camera.lookAt(0, 0, 0)
    } else if (preset === 'ligand' || preset === 'pocket') {
      const ligAtoms = visibleAtoms.filter(
        (a) => a.record === 'HETATM' && !a.isWater && !a.isMetal && !a.isNucleic
      )
      if (ligAtoms.length) {
        const lx = ligAtoms.reduce((s, a) => s + a.x, 0) / ligAtoms.length - cx
        const ly = ligAtoms.reduce((s, a) => s + a.y, 0) / ligAtoms.length - cy
        const lz = ligAtoms.reduce((s, a) => s + a.z, 0) / ligAtoms.length - cz
        camera.position.set(lx, ly, lz + (preset === 'ligand' ? 16 : 26))
        camera.lookAt(lx, ly, lz)
      }
    } else if (preset === 'dna') {
      const dnaAtoms = visibleAtoms.filter((a) => a.isNucleic)
      if (dnaAtoms.length) {
        const dx = dnaAtoms.reduce((s, a) => s + a.x, 0) / dnaAtoms.length - cx
        const dy = dnaAtoms.reduce((s, a) => s + a.y, 0) / dnaAtoms.length - cy
        const dz = dnaAtoms.reduce((s, a) => s + a.z, 0) / dnaAtoms.length - cz
        camera.position.set(dx, dy, dz + 38)
        camera.lookAt(dx, dy, dz)
      }
    } else if (preset === 'protein') {
      rootGroup.rotation.set(0.4, 0.7, 0)
      camera.position.set(0, 0, maxRadius * 2.0)
      camera.lookAt(0, 0, 0)
    }
  }, [])

  // Zoom control
  const handleZoom = (factor) => {
    const engine = engineRef.current
    if (!engine) return
    const radius = metricsRef.current.maxRadius || 30
    const minZ = radius * 0.4
    const maxZ = radius * 6.5
    engine.camera.position.z = Math.min(
      maxZ,
      Math.max(minZ, engine.camera.position.z * factor)
    )
  }

  // Reset view orientation
  const handleResetView = () => {
    const engine = engineRef.current
    if (!engine) return
    engine.rootGroup.rotation.set(0, 0, 0)
    const radius = metricsRef.current.maxRadius || 30
    engine.camera.position.set(0, 0, radius * 2.2)
    engine.camera.lookAt(0, 0, 0)
    setActivePreset('full')
  }

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    const host = hostRef.current
    if (!host) return
    if (!document.fullscreenElement) {
      host.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  // --------------------------------------------------------------------------
  // 1. PERSISTENT THREE.JS ENGINE SETUP & TEARDOWN
  // --------------------------------------------------------------------------
  useEffect(() => {
    const host = hostRef.current
    const canvasContainer = canvasContainerRef.current
    if (!host || !canvasContainer) return undefined

    if (!isWebGLAvailable()) {
      setHasWebglError(true)
      return undefined
    }

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (e) {
      console.warn('WebGLRenderer init error:', e)
      setHasWebglError(true)
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x070c18, 1)

    const initialW = Math.max(host.clientWidth || 700, 200)
    const initialH = Math.max(host.clientHeight || 520, 200)
    renderer.setSize(initialW, initialH, false)

    canvasContainer.replaceChildren(renderer.domElement)
    const canvas = renderer.domElement

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 10000)
    camera.position.set(0, 0, 80)
    camera.lookAt(0, 0, 0)

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.95)
    dirLight1.position.set(200, 300, 250)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.45)
    dirLight2.position.set(-200, -200, -150)
    scene.add(dirLight2)

    // WebGL Context Lost handling
    const handleContextLost = (e) => {
      e.preventDefault()
      setIsContextLost(true)
    }
    const handleContextRestored = () => {
      setIsContextLost(false)
      setRebuildTrigger((c) => c + 1)
    }
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!host || !renderer || !camera) return
      if (host.clientWidth <= 0 || host.clientHeight <= 0) return
      const nw = Math.max(host.clientWidth || 700, 200)
      const nh = Math.max(host.clientHeight || 520, 200)
      renderer.setSize(nw, nh, false)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(host)

    // Mouse & Pointer interaction state
    let dragging = false
    let previousMouse = { x: 0, y: 0 }
    let lastRaycastTime = 0
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const onPointerDown = (e) => {
      if (e.button !== 0 && e.button !== 1) return
      dragging = true
      previousMouse = { x: e.clientX, y: e.clientY }
    }

    const onPointerMove = (e) => {
      if (dragging) {
        const dx = e.clientX - previousMouse.x
        const dy = e.clientY - previousMouse.y
        rootGroup.rotation.y += dx * 0.007
        rootGroup.rotation.x += dy * 0.007
        previousMouse = { x: e.clientX, y: e.clientY }
        return
      }

      // Throttled raycasting for hover tooltip
      const now = performance.now()
      if (now - lastRaycastTime < 35) return
      lastRaycastTime = now

      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const { pointsMesh, atoms } = interactiveDataRef.current
      if (!pointsMesh || !atoms || !atoms.length) {
        setHoveredInfo(null)
        return
      }

      try {
        const threshold = Math.max((metricsRef.current.maxRadius || 30) / 45, 0.75)
        raycaster.params.Points = { threshold }
        raycaster.setFromCamera(pointer, camera)
        const hits = raycaster.intersectObject(pointsMesh)
        if (hits.length && atoms[hits[0].index]) {
          const a = atoms[hits[0].index]
          setHoveredInfo({
            name: a.name,
            resName: a.resName,
            resNum: a.resNum,
            chainId: a.chainId,
            residueId: a.residueId,
            element: a.element,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          })
        } else {
          setHoveredInfo(null)
        }
      } catch {
        setHoveredInfo(null)
      }
    }

    const onPointerUp = () => {
      dragging = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      const radius = metricsRef.current.maxRadius || 30
      const minZ = radius * 0.4
      const maxZ = radius * 6.5
      camera.position.z = Math.min(
        maxZ,
        Math.max(minZ, camera.position.z + e.deltaY * radius * 0.002)
      )
    }

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const { pointsMesh, atoms } = interactiveDataRef.current
      if (!pointsMesh || !atoms || !atoms.length) return

      try {
        const threshold = Math.max((metricsRef.current.maxRadius || 30) / 45, 0.85)
        raycaster.params.Points = { threshold }
        raycaster.setFromCamera(pointer, camera)
        const hits = raycaster.intersectObject(pointsMesh)
        if (hits.length && atoms[hits[0].index]) {
          const a = atoms[hits[0].index]
          if (a.record === 'HETATM' && !a.isWater && !a.isMetal && !a.isNucleic) {
            onSelectLigandRef.current?.(a.resName)
          } else if (a.residueId) {
            onSelectResidueRef.current?.(a.residueId)
          }
        }
      } catch (err) {
        console.warn('Click raycast error:', err)
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('click', onClick)

    // Render loop guarded against uncaught exceptions
    let isRunning = true
    const animate = () => {
      if (!isRunning) return
      animFrameIdRef.current = requestAnimationFrame(animate)
      if (autoSpinRef.current && !dragging) {
        rootGroup.rotation.y += 0.005
      }
      try {
        renderer.render(scene, camera)
      } catch (err) {
        console.warn('Render loop encountered error:', err)
      }
    }
    animate()

    engineRef.current = {
      renderer,
      scene,
      camera,
      rootGroup,
      canvas,
    }

    return () => {
      isRunning = false
      cancelAnimationFrame(animFrameIdRef.current)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('click', onClick)
      resizeObserver.disconnect()
      disposeHierarchy(scene)
      try {
        renderer.dispose()
        renderer.forceContextLoss()
      } catch {}
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
      engineRef.current = null
    }
  }, [rebuildTrigger])

  // --------------------------------------------------------------------------
  // 2. SCENE RECONSTRUCTION (WITHOUT RECREATING RENDERER / CONTEXT)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    const { rootGroup, camera } = engine
    disposeHierarchy(rootGroup)
    interactiveDataRef.current = { pointsMesh: null, atoms: [] }

    if (!structure?.atoms || !structure.atoms.length) {
      return
    }

    // Filter visible atoms based on visibility toggles
    const visibleAtoms = structure.atoms.filter((a) => {
      if (a.isWater) return showWater
      if (a.isMetal) return showMetals
      if (a.isNucleic) return showDna
      if (a.record === 'HETATM' && !a.isStandardAA && !a.isNucleic) return showLigands
      return showProtein
    })

    if (!visibleAtoms.length) return

    // Safe centroid calculation (checking finite numbers)
    let cx = 0, cy = 0, cz = 0
    let validCount = 0
    for (let i = 0; i < visibleAtoms.length; i++) {
      const a = visibleAtoms[i]
      if (Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z)) {
        cx += a.x
        cy += a.y
        cz += a.z
        validCount++
      }
    }
    if (validCount === 0) return
    cx /= validCount
    cy /= validCount
    cz /= validCount

    // Safe bounding radius calculation
    let maxRadius = 15
    for (let i = 0; i < visibleAtoms.length; i++) {
      const a = visibleAtoms[i]
      if (Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z)) {
        const d = Math.hypot(a.x - cx, a.y - cy, a.z - cz)
        if (d > maxRadius) maxRadius = d
      }
    }

    metricsRef.current = {
      cx,
      cy,
      cz,
      maxRadius,
      center: new THREE.Vector3(cx, cy, cz),
      visibleAtoms,
    }

    const chainColors = new Map()
    ;(structure.chains || []).forEach((c, idx) => {
      chainColors.set(c.id, CHAIN_PALETTE[idx % CHAIN_PALETTE.length])
    })

    // ----------------------------------------------------
    // A. CARTOON / BACKBONE: Segmented Spline Trace
    // ----------------------------------------------------
    if (representation === 'cartoon' || representation === 'backbone') {
      ;(structure.chains || []).forEach((chain) => {
        if (chain.type === 'protein' && !showProtein) return
        if (chain.type === 'dna' && !showDna) return

        const chainAtoms = visibleAtoms.filter(
          (a) => a.chainId === chain.id && (a.name === 'CA' || a.name === "C4'")
        )
        if (chainAtoms.length < 2) return

        // Segment chain across large crystallographic density gaps (> 5.2 Å for CA, 7.5 Å for nucleic)
        const segments = []
        let currentSeg = []
        const maxGap = chain.type === 'dna' ? 7.5 : 5.2

        for (let i = 0; i < chainAtoms.length; i++) {
          const a = chainAtoms[i]
          if (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.z)) continue
          const pt = new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz)

          if (currentSeg.length > 0) {
            const lastPt = currentSeg[currentSeg.length - 1]
            const dist = lastPt.distanceTo(pt)
            // Skip duplicate or near-identical coordinates
            if (dist < 0.05) continue
            // Break segment on large structural gap
            if (dist > maxGap) {
              if (currentSeg.length >= 2) segments.push(currentSeg)
              currentSeg = [pt]
              continue
            }
          }
          currentSeg.push(pt)
        }
        if (currentSeg.length >= 2) segments.push(currentSeg)

        const chainColor = chain.type === 'dna' ? '#f59e0b' : chainColors.get(chain.id) || '#38bdf8'

        segments.forEach((segPoints) => {
          if (representation === 'cartoon' && segPoints.length >= 3) {
            try {
              // Centripetal parameterization avoids wild loops and self-intersection
              const curve = new THREE.CatmullRomCurve3(segPoints, false, 'centripetal')
              const tubeSegments = Math.min(Math.max(segPoints.length * 2, 8), 120)
              const tubeRadius = chain.type === 'dna' ? 0.65 : 0.48
              const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, 6, false)

              // Verify all vertex coordinates are finite
              const posArr = tubeGeo.attributes.position.array
              let hasNaN = false
              for (let k = 0; k < posArr.length; k++) {
                if (!Number.isFinite(posArr[k])) {
                  hasNaN = true
                  break
                }
              }

              if (!hasNaN) {
                const tubeMat = new THREE.MeshStandardMaterial({
                  color: new THREE.Color(chainColor),
                  roughness: 0.35,
                  metalness: 0.15,
                })
                const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
                rootGroup.add(tubeMesh)
                return
              } else {
                tubeGeo.dispose()
              }
            } catch (e) {
              console.warn('TubeGeometry fallback to Line:', e)
            }
          }

          // Safe, crash-proof Line fallback for backbone or 2-point segments
          const lineGeo = new THREE.BufferGeometry().setFromPoints(segPoints)
          const lineMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(chainColor),
            linewidth: chain.type === 'dna' ? 2 : 1.5,
          })
          const lineMesh = new THREE.Line(lineGeo, lineMat)
          rootGroup.add(lineMesh)
        })
      })
    }

    // ----------------------------------------------------
    // B. INTERACTIVE ATOMS & PARTICLES MESH
    // ----------------------------------------------------
    const positions = []
    const colors = []
    const interactiveAtoms = []

    // Select atoms for rendering
    visibleAtoms.forEach((atom) => {
      if (!Number.isFinite(atom.x) || !Number.isFinite(atom.y) || !Number.isFinite(atom.z)) return

      const isPocket = pocketResidueSet.has(atom.residueId)
      const isSelected = selectedResidueId === atom.residueId || selectedResidueId === String(atom.resNum)
      const isHighlighted = highlightedResidues && (
        (highlightedResidues.position && atom.resNum === highlightedResidues.position) ||
        (highlightedResidues.start && highlightedResidues.end && atom.resNum >= highlightedResidues.start && atom.resNum <= highlightedResidues.end)
      )
      const isLigand = atom.record === 'HETATM' && !atom.isWater && !atom.isMetal && !atom.isNucleic
      const isMetal = atom.isMetal
      const isBackboneAnchor = atom.name === 'CA' || atom.name === "C4'"

      // In cartoon or backbone mode: render ligand, metal, pocket, highlighted, and CA anchors
      if (representation === 'cartoon' || representation === 'backbone') {
        if (!isLigand && !isMetal && !isPocket && !isSelected && !isHighlighted && !isBackboneAnchor) {
          return
        }
      }

      positions.push(atom.x - cx, atom.y - cy, atom.z - cz)
      interactiveAtoms.push(atom)

      let c = new THREE.Color(ELEMENT_COLORS[atom.element] || '#94a3b8')

      if (isSelected) {
        c.set('#ffffff') // Luminous white
      } else if (isHighlighted) {
        c.set('#facc15') // Bright gold
      } else if (isPocket) {
        c.set('#10b981') // Emerald green
      } else if (isLigand) {
        c.set('#38bdf8') // Vivid cyan
      } else if (isMetal) {
        c.set('#ec4899') // Magenta/pink
      } else if (atom.isNucleic) {
        c.set('#f59e0b') // Amber
      } else {
        const chainCol = chainColors.get(atom.chainId)
        if (chainCol) c.set(chainCol)
      }

      colors.push(c.r, c.g, c.b)
    })

    if (positions.length > 0) {
      const pointGeometry = new THREE.BufferGeometry()
      pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

      let pSize = 0.65
      if (representation === 'space-filling') pSize = 1.35
      else if (representation === 'surface') pSize = 1.85
      else if (representation === 'ball-stick') pSize = 0.75
      else pSize = 0.55

      const pointMaterial = new THREE.PointsMaterial({
        size: pSize,
        vertexColors: true,
        transparent: representation === 'surface',
        opacity: representation === 'surface' ? 0.32 : 0.95,
        sizeAttenuation: true,
      })

      const pointsMesh = new THREE.Points(pointGeometry, pointMaterial)
      rootGroup.add(pointsMesh)
      interactiveDataRef.current = { pointsMesh, atoms: interactiveAtoms }
    }

    // ----------------------------------------------------
    // C. CONTACT INTERACTION VECTORS (DASHED LINES)
    // ----------------------------------------------------
    if (showInteractions && pocketData?.interactions?.length) {
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.35,
        gapSize: 0.22,
        linewidth: 2,
      })

      pocketData.interactions.slice(0, 40).forEach((int) => {
        const resAtom = visibleAtoms.find((a) => a.residueId === int.residueId)
        const ligAtom = visibleAtoms.find(
          (a) => a.record === 'HETATM' && a.name === int.ligandAtom
        )
        if (
          resAtom &&
          ligAtom &&
          Number.isFinite(resAtom.x) &&
          Number.isFinite(resAtom.y) &&
          Number.isFinite(resAtom.z) &&
          Number.isFinite(ligAtom.x) &&
          Number.isFinite(ligAtom.y) &&
          Number.isFinite(ligAtom.z)
        ) {
          const lGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(ligAtom.x - cx, ligAtom.y - cy, ligAtom.z - cz),
            new THREE.Vector3(resAtom.x - cx, resAtom.y - cy, resAtom.z - cz),
          ])
          const line = new THREE.Line(lGeo, lineMat)
          line.computeLineDistances()
          rootGroup.add(line)
        }
      })
    }

    // Initialize camera position based on structure bounds
    camera.position.set(0, 0, maxRadius * 2.2)
    camera.lookAt(0, 0, 0)
  }, [
    structure,
    representation,
    selectedResidueId,
    selectedLigandId,
    highlightedResidues,
    showPocket,
    showInteractions,
    showProtein,
    showDna,
    showLigands,
    showMetals,
    showWater,
    pocketResidueSet,
    rebuildTrigger,
  ])

  // Sync with cameraPreset prop
  useEffect(() => {
    if (cameraPreset) {
      handlePreset(cameraPreset)
    }
  }, [cameraPreset, handlePreset])

  return (
    <div className="biostructure-viewer-content">
      {/* 3D Secondary Deck: Visibility & Control Strip */}
      <div className="viewer-toolbar sub-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">
            <Eye size={13} /> Elements:
          </span>
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showProtein}
              onChange={(e) => setShowProtein(e.target.checked)}
            />
            <span className="chip-label">Protein</span>
          </label>
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showDna}
              onChange={(e) => setShowDna(e.target.checked)}
            />
            <span className="chip-label">DNA/RNA</span>
          </label>
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showLigands}
              onChange={(e) => setShowLigands(e.target.checked)}
            />
            <span className="chip-label">Ligands</span>
          </label>
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showMetals}
              onChange={(e) => setShowMetals(e.target.checked)}
            />
            <span className="chip-label">Metals</span>
          </label>
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showWater}
              onChange={(e) => setShowWater(e.target.checked)}
            />
            <span className="chip-label">Water</span>
          </label>
        </div>

        <div className="toolbar-section right">
          <span className="atom-count-badge">
            {structure?.atoms?.length ? `${structure.atoms.length.toLocaleString()} Atoms` : 'Coordinates Ready'}
          </span>
          <button
            className="preset-btn"
            onClick={handleResetView}
            title="Reset 3D Orientation"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            className="preset-btn"
            onClick={() => handleZoom(0.85)}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            className="preset-btn"
            onClick={() => handleZoom(1.18)}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            className="preset-btn"
            onClick={handleToggleFullscreen}
            title="Fullscreen 3D Workspace"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Host */}
      <div className="viewer-canvas-host" ref={hostRef}>
        {/* Isolated Three.js Canvas Container: guarantees React never mutates Three.js canvas */}
        <div
          className="viewer-three-canvas-container"
          ref={canvasContainerRef}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}
        />

        {/* WebGL Context Lost Fallback Overlay */}
        {isContextLost && (
          <div className="viewer-context-lost-overlay" style={{ position: 'relative', zIndex: 10 }}>
            <AlertCircle size={28} className="text-amber-400" />
            <h4>3D Graphics Context Paused</h4>
            <p>The WebGL context was suspended by your browser to free graphics memory.</p>
            <button
              type="button"
              className="preset-btn active"
              onClick={() => setRebuildTrigger((c) => c + 1)}
            >
              <RefreshCw size={13} /> Restore 3D View
            </button>
          </div>
        )}

        {/* WebGL Unsupported Fallback Overlay */}
        {hasWebglError && (
          <div className="viewer-context-lost-overlay" style={{ position: 'relative', zIndex: 10 }}>
            <AlertCircle size={28} className="text-rose-400" />
            <h4>WebGL Hardware Acceleration Unavailable</h4>
            <p>
              Your current environment does not support WebGL 3D rendering.
              Detailed sequence maps, binding pockets, and structural alignment tables remain fully available below.
            </p>
          </div>
        )}

        {/* Interactive Hover Tooltip */}
        {hoveredInfo && (
          <div
            className="viewer-atom-tooltip"
            style={{ left: hoveredInfo.x + 14, top: hoveredInfo.y - 14, zIndex: 20 }}
          >
            <strong>
              {hoveredInfo.resName} {hoveredInfo.resNum} ({hoveredInfo.chainId})
            </strong>
            <span>
              Atom: {hoveredInfo.name} ({hoveredInfo.element})
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Smart Structure Legend */}
      <div className="smart-structure-legend">
        <div className="legend-entry">
          <span className="swatch-dot protein" />
          <span>Protein Chains</span>
        </div>
        {structure?.chains?.some((c) => c.type === 'dna') && (
          <div className="legend-entry">
            <span className="swatch-dot dna" />
            <span>DNA / Nucleic Acid</span>
          </div>
        )}
        {structure?.ligands?.length > 0 && (
          <div className="legend-entry">
            <span className="swatch-dot ligand" />
            <span>Bound Ligand ({structure.ligands[0]?.name || structure.ligands[0]?.id || 'Ligand'})</span>
          </div>
        )}
        {showPocket && (
          <div className="legend-entry">
            <span className="swatch-dot pocket" />
            <span>Binding Pocket Contacts</span>
          </div>
        )}
        {structure?.metalIons?.length > 0 && (
          <div className="legend-entry">
            <span className="swatch-dot metal" />
            <span>Metal Ions ({structure.metalIons.map((m) => m?.element || m?.id || 'Ion').filter(Boolean).join(', ')})</span>
          </div>
        )}
      </div>
    </div>
  )
}
