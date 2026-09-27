import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import {
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Layers,
  Sparkles,
  Compass,
  Target,
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
  onSelectResidue = () => {},
  onSelectLigand = () => {},
}) {
  const hostRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneStateRef = useRef(null)

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

  useEffect(() => {
    const host = hostRef.current
    if (!host || !structure?.atoms?.length) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x070c18, 1)
    host.replaceChildren(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 8000)
    const group = new THREE.Group()
    scene.add(group)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9)
    dirLight1.position.set(200, 300, 250)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4)
    dirLight2.position.set(-200, -200, -150)
    scene.add(dirLight2)

    // Filter visible atoms based on toggles
    const visibleAtoms = structure.atoms.filter((a) => {
      if (a.isWater) return showWater
      if (a.isMetal) return showMetals
      if (a.isNucleic) return showDna
      if (a.record === 'HETATM' && !a.isStandardAA && !a.isNucleic) return showLigands
      return showProtein
    })

    if (!visibleAtoms.length) {
      renderer.dispose()
      return undefined
    }

    // Centering calculation
    let cx = 0, cy = 0, cz = 0
    visibleAtoms.forEach((a) => {
      cx += a.x
      cy += a.y
      cz += a.z
    })
    cx /= visibleAtoms.length
    cy /= visibleAtoms.length
    cz /= visibleAtoms.length
    const center = new THREE.Vector3(cx, cy, cz)

    let maxRadius = 15
    visibleAtoms.forEach((a) => {
      const dist = Math.hypot(a.x - cx, a.y - cy, a.z - cz)
      if (dist > maxRadius) maxRadius = dist
    })

    const chainColors = new Map()
    structure.chains.forEach((c, idx) => {
      chainColors.set(c.id, CHAIN_PALETTE[idx % CHAIN_PALETTE.length])
    })

    // 1. CARTOON / RIBBON or BACKBONE TRACE
    if (representation === 'cartoon' || representation === 'backbone') {
      structure.chains.forEach((chain) => {
        if (chain.type === 'protein' && !showProtein) return
        if (chain.type === 'dna' && !showDna) return

        const chainAtoms = visibleAtoms.filter(
          (a) => a.chainId === chain.id && (a.name === 'CA' || a.name === "C4'")
        )
        if (chainAtoms.length < 2) return

        const points = chainAtoms.map(
          (a) => new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz)
        )

        // Smooth curve
        const curve = new THREE.CatmullRomCurve3(points)
        const tubeSegments = points.length * 4
        const tubeRadius = chain.type === 'dna' ? 0.75 : 0.55

        const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, 8, false)
        const chainColor = chain.type === 'dna' ? '#f59e0b' : chainColors.get(chain.id) || '#38bdf8'
        const tubeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(chainColor),
          roughness: 0.35,
          metalness: 0.15,
        })
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
        group.add(tubeMesh)
      })
    }

    // 2. BALL & STICK or SPACE-FILLING or SURFACE
    const positions = []
    const colors = []
    const sizes = []

    visibleAtoms.forEach((atom) => {
      const px = atom.x - cx
      const py = atom.y - cy
      const pz = atom.z - cz
      positions.push(px, py, pz)

      const isPocket = pocketResidueSet.has(atom.residueId)
      const isSelected = selectedResidueId === atom.residueId || selectedResidueId === String(atom.resNum)
      const isHighlighted = highlightedResidues && (
        (highlightedResidues.position && atom.resNum === highlightedResidues.position) ||
        (highlightedResidues.start && highlightedResidues.end && atom.resNum >= highlightedResidues.start && atom.resNum <= highlightedResidues.end)
      )
      const isLigand = atom.record === 'HETATM' && !atom.isWater && !atom.isMetal && !atom.isNucleic
      const isMetal = atom.isMetal

      let c = new THREE.Color(ELEMENT_COLORS[atom.element] || '#94a3b8')

      if (isSelected) {
        c.set('#ffffff')
      } else if (isHighlighted) {
        c.set('#facc15') // Luminous gold for active sites / highlighted domain
      } else if (isPocket) {
        c.set('#10b981') // Glowing emerald for binding pocket residues
      } else if (isLigand) {
        c.set('#38bdf8') // Vivid cyan for ligand
      } else if (isMetal) {
        c.set('#ec4899') // Magenta/pink for metal ions
      } else if (atom.isNucleic) {
        c.set('#f59e0b') // Amber for DNA/RNA
      } else {
        const chainCol = chainColors.get(atom.chainId)
        if (chainCol) c.set(chainCol)
      }

      colors.push(c.r, c.g, c.b)

      let size = 0.5
      if (representation === 'space-filling') size = 1.4
      else if (representation === 'surface') size = 1.8
      else if (representation === 'ball-stick') size = isLigand || isPocket ? 0.85 : 0.45
      else size = 0.3
      sizes.push(size)
    })

    const pointGeometry = new THREE.BufferGeometry()
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const pointMaterial = new THREE.PointsMaterial({
      size: representation === 'space-filling' ? 1.4 : representation === 'surface' ? 1.8 : 0.65,
      vertexColors: true,
      transparent: representation === 'surface',
      opacity: representation === 'surface' ? 0.28 : 0.95,
      sizeAttenuation: true,
    })
    const pointsMesh = new THREE.Points(pointGeometry, pointMaterial)
    group.add(pointsMesh)

    // 3. INTERACTION DASHED LINES
    if (showInteractions && pocketData?.interactions?.length) {
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.3,
        gapSize: 0.2,
        linewidth: 2,
      })

      pocketData.interactions.slice(0, 40).forEach((int) => {
        const resAtom = visibleAtoms.find((a) => a.residueId === int.residueId)
        const ligAtom = visibleAtoms.find(
          (a) => a.record === 'HETATM' && a.name === int.ligandAtom
        )
        if (resAtom && ligAtom) {
          const lGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(ligAtom.x - cx, ligAtom.y - cy, ligAtom.z - cz),
            new THREE.Vector3(resAtom.x - cx, resAtom.y - cy, resAtom.z - cz),
          ])
          const line = new THREE.Line(lGeo, lineMat)
          line.computeLineDistances()
          group.add(line)
        }
      })
    }

    // Resize handler
    const resize = () => {
      const w = host.clientWidth || 700
      const h = host.clientHeight || 480
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.set(0, 0, maxRadius * 2.2)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    // Raycasting & Interaction
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points.threshold = Math.max(maxRadius / 45, 0.7)
    const pointer = new THREE.Vector2()

    let dragging = false
    let previous = { x: 0, y: 0 }

    const onPointerDown = (e) => {
      dragging = true
      previous = { x: e.clientX, y: e.clientY }
    }

    const onPointerMove = (e) => {
      if (dragging) {
        group.rotation.y += (e.clientX - previous.x) * 0.007
        group.rotation.x += (e.clientY - previous.y) * 0.007
        previous = { x: e.clientX, y: e.clientY }
        return
      }

      // Check hover
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      const hits = raycaster.intersectObject(pointsMesh)
      if (hits.length && visibleAtoms[hits[0].index]) {
        const a = visibleAtoms[hits[0].index]
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
    }

    const onPointerUp = () => {
      dragging = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      camera.position.z = Math.min(
        maxRadius * 5.5,
        Math.max(maxRadius * 0.5, camera.position.z + e.deltaY * maxRadius * 0.002)
      )
    }

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(pointsMesh)
      if (hits.length && visibleAtoms[hits[0].index]) {
        const a = visibleAtoms[hits[0].index]
        if (a.record === 'HETATM' && !a.isWater && !a.isMetal && !a.isNucleic) {
          onSelectLigand(a.resName)
        } else if (a.residueId) {
          onSelectResidue(a.residueId)
        }
      }
    }

    const canvas = renderer.domElement
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('click', onClick)

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    sceneStateRef.current = {
      group,
      camera,
      maxRadius,
      center,
      visibleAtoms,
    }

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('click', onClick)
      pointGeometry.dispose()
      pointMaterial.dispose()
      renderer.dispose()
      rendererRef.current = null
    }
  }, [
    structure,
    representation,
    selectedResidueId,
    selectedLigandId,
    showPocket,
    showInteractions,
    showProtein,
    showDna,
    showLigands,
    showMetals,
    showWater,
    pocketResidueSet,
  ])

  // Camera presets animation handler
  const handlePreset = (preset) => {
    setActivePreset(preset)
    const state = sceneStateRef.current
    if (!state) return

    const { group, camera, maxRadius, visibleAtoms, center } = state

    if (preset === 'full') {
      group.rotation.set(0, 0, 0)
      camera.position.set(0, 0, maxRadius * 2.2)
      camera.lookAt(0, 0, 0)
    } else if (preset === 'ligand' || preset === 'pocket') {
      const ligAtoms = visibleAtoms.filter(
        (a) => a.record === 'HETATM' && !a.isWater && !a.isMetal && !a.isNucleic
      )
      if (ligAtoms.length) {
        const lx = ligAtoms.reduce((s, a) => s + a.x, 0) / ligAtoms.length - center.x
        const ly = ligAtoms.reduce((s, a) => s + a.y, 0) / ligAtoms.length - center.y
        const lz = ligAtoms.reduce((s, a) => s + a.z, 0) / ligAtoms.length - center.z
        camera.position.set(lx, ly, lz + (preset === 'ligand' ? 14 : 24))
        camera.lookAt(lx, ly, lz)
      }
    } else if (preset === 'dna') {
      const dnaAtoms = visibleAtoms.filter((a) => a.isNucleic)
      if (dnaAtoms.length) {
        const dx = dnaAtoms.reduce((s, a) => s + a.x, 0) / dnaAtoms.length - center.x
        const dy = dnaAtoms.reduce((s, a) => s + a.y, 0) / dnaAtoms.length - center.y
        const dz = dnaAtoms.reduce((s, a) => s + a.z, 0) / dnaAtoms.length - center.z
        camera.position.set(dx, dy, dz + 36)
        camera.lookAt(dx, dy, dz)
      }
    } else if (preset === 'protein') {
      group.rotation.set(0.5, 0.8, 0)
      camera.position.set(0, 0, maxRadius * 2.1)
      camera.lookAt(0, 0, 0)
    }
  }

  // Effect to react to external cameraPreset prop
  useEffect(() => {
    if (cameraPreset) {
      handlePreset(cameraPreset)
    }
  }, [cameraPreset])

  return (
    <div className="biostructure-viewer-container">
      {/* Top 3D Control Deck */}
      <div className="viewer-toolbar">
        {/* Camera Presets */}
        <div className="toolbar-section">
          <span className="toolbar-label">
            <Compass size={13} /> Camera:
          </span>
          <button
            className={`preset-btn ${activePreset === 'full' ? 'active' : ''}`}
            onClick={() => handlePreset('full')}
          >
            Full Complex
          </button>
          <button
            className={`preset-btn ${activePreset === 'ligand' ? 'active' : ''}`}
            onClick={() => handlePreset('ligand')}
          >
            Ligand
          </button>
          <button
            className={`preset-btn ${activePreset === 'pocket' ? 'active' : ''}`}
            onClick={() => handlePreset('pocket')}
          >
            Binding Pocket
          </button>
          <button
            className={`preset-btn ${activePreset === 'dna' ? 'active' : ''}`}
            onClick={() => handlePreset('dna')}
          >
            DNA / Nucleic
          </button>
          <button
            className={`preset-btn ${activePreset === 'protein' ? 'active' : ''}`}
            onClick={() => handlePreset('protein')}
          >
            Protein Core
          </button>
        </div>

        {/* Component Visibility Toggles */}
        <div className="toolbar-section right">
          <span className="toolbar-label">
            <Eye size={13} /> Visible:
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
      </div>

      {/* 3D WebGL Canvas Host */}
      <div className="viewer-canvas-host" ref={hostRef}>
        {/* Interactive Hover Tooltip */}
        {hoveredInfo && (
          <div
            className="viewer-atom-tooltip"
            style={{ left: hoveredInfo.x + 12, top: hoveredInfo.y - 12 }}
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
            <span>Bound Ligand ({structure.ligands[0].name || structure.ligands[0].id})</span>
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
            <span>Metal Ions ({structure.metalIons.map((m) => m.element).join(', ')})</span>
          </div>
        )}
      </div>
    </div>
  )
}
