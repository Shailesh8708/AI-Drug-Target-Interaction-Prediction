import { useEffect, useRef, useState, useMemo } from 'react'
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
  Layers,
  Sparkles,
  Info,
} from 'lucide-react'
import { ELEMENT_METRICS } from '../../../server/services/compoundResolver.js'

export default function Interactive3DComparison({
  compoundA,
  compoundB,
  mcs,
}) {
  const [representation, setRepresentation] = useState('ball-stick') // 'ball-stick' | 'space-filling' | 'wireframe'
  const [highlightCore, setHighlightCore] = useState(true)
  const [syncRotation, setSyncRotation] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)

  const containerRefA = useRef(null)
  const containerRefB = useRef(null)

  // Three.js instances
  const sceneStateA = useRef(null)
  const sceneStateB = useRef(null)

  const commonAtomsSetA = useMemo(() => new Set(mcs?.commonAtomsA || []), [mcs])
  const commonAtomsSetB = useMemo(() => new Set(mcs?.commonAtomsB || []), [mcs])

  // Helper to build 3D mesh for a compound
  const buildMolecule3D = (compound, isCompoundA, group) => {
    group.clear()
    const atoms = compound?.atoms || []
    const bonds = compound?.bonds || []
    if (!atoms.length) return

    // Calculate center of mass for centering
    let cx = 0, cy = 0, cz = 0
    atoms.forEach((a) => {
      cx += Number(a.x) || 0
      cy += Number(a.y) || 0
      cz += Number(a.z) || 0
    })
    cx /= atoms.length
    cy /= atoms.length
    cz /= atoms.length

    const commonSet = isCompoundA ? commonAtomsSetA : commonAtomsSetB

    // Draw Atoms
    atoms.forEach((atom, i) => {
      const idx = atom.index ?? i
      const isCommon = commonSet.has(idx)
      const elem = atom.element || 'C'
      const metrics = ELEMENT_METRICS[elem] || { color: '#94a3b8', vdwRadius: 1.5, covRadius: 0.7 }

      let atomColor = metrics.color
      if (highlightCore) {
        if (isCommon) {
          atomColor = '#10b981' // Emerald for shared scaffold
        } else {
          atomColor = isCompoundA ? '#64748b' : '#f59e0b' // Amber for added substituents in B
        }
      }

      let radius = 0.35
      if (representation === 'space-filling') {
        radius = (metrics.vdwRadius || 1.5) * 0.32
      } else if (representation === 'wireframe') {
        radius = 0.12
      }

      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(atomColor),
        roughness: 0.3,
        metalness: 0.2,
      })
      const mesh = new THREE.Mesh(sphereGeo, sphereMat)
      mesh.position.set(
        (Number(atom.x) || 0) - cx,
        (Number(atom.y) || 0) - cy,
        (Number(atom.z) || 0) - cz
      )
      group.add(mesh)
    })

    // Draw Bonds
    if (representation !== 'space-filling') {
      bonds.forEach((bond) => {
        const atom1 = atoms.find((a, i) => (a.index ?? i) === bond.from)
        const atom2 = atoms.find((a, i) => (a.index ?? i) === bond.to)
        if (!atom1 || !atom2) return

        const p1 = new THREE.Vector3((Number(atom1.x) || 0) - cx, (Number(atom1.y) || 0) - cy, (Number(atom1.z) || 0) - cz)
        const p2 = new THREE.Vector3((Number(atom2.x) || 0) - cx, (Number(atom2.y) || 0) - cy, (Number(atom2.z) || 0) - cz)

        const isBondCommon = commonSet.has(bond.from) && commonSet.has(bond.to)
        let bondColor = '#475569'
        if (highlightCore) {
          if (isBondCommon) bondColor = '#10b981'
          else if (!isCompoundA) bondColor = '#f59e0b'
        }

        const distance = p1.distanceTo(p2)
        const cylinderGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 12)
        const cylinderMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(bondColor),
          roughness: 0.4,
        })
        const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat)

        const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
        cylinder.position.copy(midpoint)
        cylinder.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3().subVectors(p2, p1).normalize()
        )
        group.add(cylinder)
      })
    }
  }

  // Initialize Three.js viewport
  const initThreeViewport = (container, isCompoundA) => {
    if (!container) return null

    const width = container.clientWidth || 460
    const height = 360

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a101d)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 8)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      container.replaceChildren(renderer.domElement)
    } catch {
      return null
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight1.position.set(5, 10, 7)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4)
    dirLight2.position.set(-5, -5, -5)
    scene.add(dirLight2)

    const group = new THREE.Group()
    scene.add(group)

    return {
      renderer,
      scene,
      camera,
      group,
      width,
      height,
    }
  }

  useEffect(() => {
    const sA = initThreeViewport(containerRefA.current, true)
    const sB = initThreeViewport(containerRefB.current, false)

    sceneStateA.current = sA
    sceneStateB.current = sB

    if (sA && compoundA) buildMolecule3D(compoundA, true, sA.group)
    if (sB && compoundB) buildMolecule3D(compoundB, false, sB.group)

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (autoRotate) {
        if (sA?.group) sA.group.rotation.y += 0.01
        if (sB?.group) sB.group.rotation.y += 0.01
      }

      if (sA) sA.renderer.render(sA.scene, sA.camera)
      if (sB) sB.renderer.render(sB.scene, sB.camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      if (sA?.renderer) sA.renderer.dispose()
      if (sB?.renderer) sB.renderer.dispose()
    }
  }, [compoundA, compoundB, representation, highlightCore])

  // Mouse drag orbit controls
  const handlePointerDown = (e, isA) => {
    const isDragging = { current: true, startX: e.clientX, startY: e.clientY }

    const onPointerMove = (moveEvt) => {
      if (!isDragging.current) return
      const dx = moveEvt.clientX - isDragging.startX
      const dy = moveEvt.clientY - isDragging.startY
      isDragging.startX = moveEvt.clientX
      isDragging.startY = moveEvt.clientY

      const rotY = dx * 0.008
      const rotX = dy * 0.008

      const targetA = sceneStateA.current?.group
      const targetB = sceneStateB.current?.group

      if (syncRotation) {
        if (targetA) {
          targetA.rotation.y += rotY
          targetA.rotation.x += rotX
        }
        if (targetB) {
          targetB.rotation.y += rotY
          targetB.rotation.x += rotX
        }
      } else {
        const activeTarget = isA ? targetA : targetB
        if (activeTarget) {
          activeTarget.rotation.y += rotY
          activeTarget.rotation.x += rotX
        }
      }
    }

    const onPointerUp = () => {
      isDragging.current = false
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Wheel zoom
  const handleWheel = (e, isA) => {
    e.preventDefault()
    const zoomDelta = e.deltaY > 0 ? 0.5 : -0.5

    const applyZoom = (camera) => {
      if (camera) {
        camera.position.z = Math.min(18, Math.max(3, camera.position.z + zoomDelta))
      }
    }

    if (syncRotation) {
      applyZoom(sceneStateA.current?.camera)
      applyZoom(sceneStateB.current?.camera)
    } else {
      applyZoom(isA ? sceneStateA.current?.camera : sceneStateB.current?.camera)
    }
  }

  // Reset Camera
  const handleReset = () => {
    if (sceneStateA.current) {
      sceneStateA.current.camera.position.set(0, 0, 8)
      sceneStateA.current.group.rotation.set(0, 0, 0)
    }
    if (sceneStateB.current) {
      sceneStateB.current.camera.position.set(0, 0, 8)
      sceneStateB.current.group.rotation.set(0, 0, 0)
    }
  }

  return (
    <div className="comparison-3d-wrapper">
      {/* 3D Toolbar */}
      <div className="comparison-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">
            <Box size={14} /> 3D Style:
          </span>
          <button
            className={`tool-button ${representation === 'ball-stick' ? 'active' : ''}`}
            onClick={() => setRepresentation('ball-stick')}
          >
            Ball & Stick
          </button>
          <button
            className={`tool-button ${representation === 'space-filling' ? 'active' : ''}`}
            onClick={() => setRepresentation('space-filling')}
          >
            Space-Filling (vdW)
          </button>
          <button
            className={`tool-button ${representation === 'wireframe' ? 'active' : ''}`}
            onClick={() => setRepresentation('wireframe')}
          >
            Licorice / Wire
          </button>
        </div>

        <div className="toolbar-group right">
          <label className="checkbox-toggle" title="Synchronize 3D rotations between both molecules">
            <input
              type="checkbox"
              checked={syncRotation}
              onChange={(e) => setSyncRotation(e.target.checked)}
            />
            <span>Sync 3D Rotations</span>
          </label>

          <label className="checkbox-toggle">
            <input
              type="checkbox"
              checked={highlightCore}
              onChange={(e) => setHighlightCore(e.target.checked)}
            />
            <span>Highlight Common Core</span>
          </label>

          <button
            className={`icon-tool-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate((prev) => !prev)}
            title={autoRotate ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
          >
            {autoRotate ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button className="icon-tool-btn" onClick={handleReset} title="Reset camera">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Dual 3D Viewport Grid */}
      <div className="dual-canvas-grid">
        <div className="molecule-view-box">
          <div className="view-header">
            <div className="badge-identity">
              <span className="molecule-badge a">COMPOUND A · 3D</span>
              <strong className="molecule-title">{compoundA.name || 'Compound A'}</strong>
            </div>
            <small className="formula-tag">{compoundA.formula || ''}</small>
          </div>
          <div
            className="canvas-container three-canvas-host"
            ref={containerRefA}
            onPointerDown={(e) => handlePointerDown(e, true)}
            onWheel={(e) => handleWheel(e, true)}
          />
        </div>

        <div className="molecule-view-box">
          <div className="view-header">
            <div className="badge-identity">
              <span className="molecule-badge b">COMPOUND B · 3D</span>
              <strong className="molecule-title">{compoundB.name || 'Compound B'}</strong>
            </div>
            <small className="formula-tag">{compoundB.formula || ''}</small>
          </div>
          <div
            className="canvas-container three-canvas-host"
            ref={containerRefB}
            onPointerDown={(e) => handlePointerDown(e, false)}
            onWheel={(e) => handleWheel(e, false)}
          />
        </div>
      </div>

      <div className="comparison-legend">
        <div className="legend-item">
          <span className="legend-swatch emerald-core" />
          <span>Shared 3D Scaffold ({mcs?.commonAtomsCount ?? 0} atoms)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch amber-diff" />
          <span>Added 3D Conformer Substituents</span>
        </div>
        <div className="legend-note">
          <Info size={13} />
          <span>Drag with mouse to rotate. Scroll to zoom. Rotations are synchronized in real-time.</span>
        </div>
      </div>
    </div>
  )
}
