import { useState, useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  Box,
  Circle,
  Eye,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react'

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
}

const ELEMENT_RADII = {
  C: 0.45,
  N: 0.42,
  O: 0.4,
  S: 0.55,
  P: 0.52,
  F: 0.38,
  CL: 0.5,
  BR: 0.6,
  I: 0.65,
  H: 0.25,
}

export default function DrugStructureViewer({ drug }) {
  const [viewMode, setViewMode] = useState('3d') // '2d' | '3d'
  const [representation, setRepresentation] = useState('ball-stick') // 'ball-stick' | 'space-filling' | 'wireframe'
  const [autoRotate, setAutoRotate] = useState(true)
  const [selectedAtom, setSelectedAtom] = useState(null)

  const canvasContainerRef = useRef(null)
  const sceneStateRef = useRef(null)

  // Atoms and Bonds
  const atoms = drug?.atoms || []
  const bonds = drug?.bonds || []

  // Fallback 3D coordinates generator if drug only had 2D/SMILES
  const processedAtoms = useMemo(() => {
    if (atoms.length > 0 && atoms.some((a) => a.z !== undefined && a.z !== 0)) {
      return atoms
    }
    // Synthesize pseudo-3D coordinates from 2D or ring topology
    return atoms.map((a, i) => {
      const angle = (i / Math.max(1, atoms.length)) * Math.PI * 2
      const zOffset = Math.sin(angle * 2) * 1.2
      return {
        ...a,
        x: a.x ?? Math.cos(angle) * 3,
        y: a.y ?? Math.sin(angle) * 3,
        z: a.z ?? zOffset,
      }
    })
  }, [atoms])

  // ==========================================
  // THREE.JS 3D RENDER LOOP
  // ==========================================
  useEffect(() => {
    if (viewMode !== '3d' || !canvasContainerRef.current) return

    const container = canvasContainerRef.current
    const width = container.clientWidth || 450
    const height = container.clientHeight || 380

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 16)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight1.position.set(10, 20, 15)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6)
    dirLight2.position.set(-10, -10, -10)
    scene.add(dirLight2)

    // Molecular Group
    const molGroup = new THREE.Group()
    scene.add(molGroup)

    // Center of mass calculation
    let cx = 0, cy = 0, cz = 0
    if (processedAtoms.length > 0) {
      processedAtoms.forEach((a) => {
        cx += Number(a.x) || 0
        cy += Number(a.y) || 0
        cz += Number(a.z) || 0
      })
      cx /= processedAtoms.length
      cy /= processedAtoms.length
      cz /= processedAtoms.length
    }

    // Build Atoms
    const atomMeshes = []
    processedAtoms.forEach((atom, idx) => {
      const elem = (atom.element || 'C').toUpperCase()
      const colorHex = ELEMENT_COLORS[elem] || '#94a3b8'
      const baseRadius = ELEMENT_RADII[elem] || 0.45
      const radius = representation === 'space-filling' ? baseRadius * 2.2 : baseRadius

      const geom = new THREE.SphereGeometry(radius, 24, 24)
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.2,
        wireframe: representation === 'wireframe',
      })

      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(
        (Number(atom.x) || 0) - cx,
        (Number(atom.y) || 0) - cy,
        (Number(atom.z) || 0) - cz
      )
      mesh.userData = { atom, index: idx }
      molGroup.add(mesh)
      atomMeshes.push(mesh)
    })

    // Build Bonds (if not space-filling)
    if (representation !== 'space-filling' && bonds.length > 0) {
      bonds.forEach((bond) => {
        const a1 = processedAtoms[bond.atom1] || processedAtoms.find((a) => a.index === bond.atom1)
        const a2 = processedAtoms[bond.atom2] || processedAtoms.find((a) => a.index === bond.atom2)
        if (!a1 || !a2) return

        const p1 = new THREE.Vector3(
          (Number(a1.x) || 0) - cx,
          (Number(a1.y) || 0) - cy,
          (Number(a1.z) || 0) - cz
        )
        const p2 = new THREE.Vector3(
          (Number(a2.x) || 0) - cx,
          (Number(a2.y) || 0) - cy,
          (Number(a2.z) || 0) - cz
        )

        const dist = p1.distanceTo(p2)
        const bondRadius = representation === 'wireframe' ? 0.04 : 0.12
        const bondGeom = new THREE.CylinderGeometry(bondRadius, bondRadius, dist, 12)
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.4,
          metalness: 0.2,
        })
        const bondMesh = new THREE.Mesh(bondGeom, bondMat)

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
        bondMesh.position.copy(mid)

        const dir = new THREE.Vector3().subVectors(p2, p1).normalize()
        const axis = new THREE.Vector3(0, 1, 0)
        bondMesh.quaternion.setFromUnitVectors(axis, dir)

        molGroup.add(bondMesh)
      })
    }

    // Interaction State
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      molGroup.rotation.y += deltaX * 0.008
      molGroup.rotation.x += deltaY * 0.008
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      camera.position.z = Math.max(5, Math.min(40, camera.position.z + e.deltaY * 0.02))
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    // Animation Loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (autoRotate && !isDragging) {
        molGroup.rotation.y += 0.006
      }
      renderer.render(scene, camera)
    }
    animate()

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      molGroup,
      resetCamera: () => {
        camera.position.set(0, 0, 16)
        molGroup.rotation.set(0, 0, 0)
      },
      zoomIn: () => {
        camera.position.z = Math.max(5, camera.position.z - 2)
      },
      zoomOut: () => {
        camera.position.z = Math.min(40, camera.position.z + 2)
      },
    }

    // Resize handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('wheel', onWheel)
      renderer.dispose()
      if (container) container.innerHTML = ''
    }
  }, [viewMode, representation, processedAtoms, bonds, autoRotate])

  // ==========================================
  // 2D SVG PROJECTION
  // ==========================================
  const render2DSVG = () => {
    if (!processedAtoms.length) {
      return (
        <div style={{ color: '#94a3b8', fontSize: '13px', display: 'grid', placeItems: 'center', height: '100%' }}>
          No 2D atomic graph available for this compound.
        </div>
      )
    }

    // Normalize coordinates to 400x320 SVG viewport
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    processedAtoms.forEach((a) => {
      const x = Number(a.x) || 0
      const y = Number(a.y) || 0
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    })

    const spanX = Math.max(1, maxX - minX)
    const spanY = Math.max(1, maxY - minY)
    const padding = 40
    const scale = Math.min((380 - padding * 2) / spanX, (300 - padding * 2) / spanY)

    const toSvgX = (x) => padding + ((Number(x) || 0) - minX) * scale
    const toSvgY = (y) => padding + ((Number(y) || 0) - minY) * scale

    return (
      <svg className="structure-2d-canvas" viewBox="0 0 380 320">
        {/* Bonds */}
        {bonds.map((b, i) => {
          const a1 = processedAtoms[b.atom1] || processedAtoms.find((a) => a.index === b.atom1)
          const a2 = processedAtoms[b.atom2] || processedAtoms.find((a) => a.index === b.atom2)
          if (!a1 || !a2) return null
          const x1 = toSvgX(a1.x)
          const y1 = toSvgY(a1.y)
          const x2 = toSvgX(a2.x)
          const y2 = toSvgY(a2.y)
          const isDouble = b.order === 2

          return (
            <g key={`bond-${i}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748b"
                strokeWidth={isDouble ? 3.5 : 2}
                strokeLinecap="round"
              />
              {isDouble && (
                <line
                  x1={x1 + 2}
                  y1={y1 + 2}
                  x2={x2 + 2}
                  y2={y2 + 2}
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
            </g>
          )
        })}

        {/* Atoms */}
        {processedAtoms.map((atom, i) => {
          const x = toSvgX(atom.x)
          const y = toSvgY(atom.y)
          const elem = (atom.element || 'C').toUpperCase()
          const color = ELEMENT_COLORS[elem] || '#94a3b8'
          const isCarbon = elem === 'C'

          return (
            <g
              key={`atom-${i}`}
              onClick={() => setSelectedAtom(atom)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={x}
                cy={y}
                r={isCarbon ? 6 : 10}
                fill={isCarbon ? '#0f172a' : color}
                stroke={color}
                strokeWidth={2}
              />
              {!isCarbon && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="monospace"
                >
                  {elem}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="structure-panel-box">
      <div className="panel-subheading">
        <h3>
          <Layers size={17} color="#10b981" />
          Molecular Conformation
        </h3>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
          >
            3D WebGL
          </button>
          <button
            className={`view-mode-btn ${viewMode === '2d' ? 'active' : ''}`}
            onClick={() => setViewMode('2d')}
          >
            2D Schematic
          </button>
        </div>
      </div>

      <div className="structure-viewport">
        {viewMode === '3d' ? (
          <>
            <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* 3D Viewport Toolbar */}
            <div className="viewport-toolbar">
              <button
                className="tool-icon-btn"
                title="Reset Camera View"
                onClick={() => sceneStateRef.current?.resetCamera()}
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="tool-icon-btn"
                title="Zoom In"
                onClick={() => sceneStateRef.current?.zoomIn()}
              >
                <ZoomIn size={15} />
              </button>
              <button
                className="tool-icon-btn"
                title="Zoom Out"
                onClick={() => sceneStateRef.current?.zoomOut()}
              >
                <ZoomOut size={15} />
              </button>
              <button
                className={`tool-icon-btn ${autoRotate ? 'active' : ''}`}
                title={autoRotate ? 'Pause Rotation' : 'Auto-Rotate'}
                onClick={() => setAutoRotate(!autoRotate)}
              >
                {autoRotate ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>

            {/* Representation Selector */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '4px' }}>
              <button
                className={`view-mode-btn ${representation === 'ball-stick' ? 'active' : ''}`}
                onClick={() => setRepresentation('ball-stick')}
              >
                Ball & Stick
              </button>
              <button
                className={`view-mode-btn ${representation === 'space-filling' ? 'active' : ''}`}
                onClick={() => setRepresentation('space-filling')}
              >
                Space-Filling
              </button>
              <button
                className={`view-mode-btn ${representation === 'wireframe' ? 'active' : ''}`}
                onClick={() => setRepresentation('wireframe')}
              >
                Wireframe
              </button>
            </div>
          </>
        ) : (
          render2DSVG()
        )}

        {/* Viewport Meta Pill */}
        <div className="viewport-info-tag">
          <Info size={13} color="#38bdf8" />
          <span>
            {processedAtoms.length} Atoms · {bonds.length} Bonds ·{' '}
            {viewMode === '3d' ? `${representation} mode` : '2D skeletal diagram'}
          </span>
        </div>
      </div>
    </div>
  )
}
