import { useEffect, useRef, useState, useMemo } from 'react'
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Sparkles,
  Info,
  Check,
} from 'lucide-react'
import { ELEMENT_METRICS } from '../../../server/services/compoundResolver.js'

function getAtomColor(element, isCommon, isUnique, highlightMode) {
  if (highlightMode === 'mcs') {
    if (isCommon) return '#10b981' // Vibrant emerald green for shared core
    return '#64748b' // Dimmed slate for non-shared
  }
  if (highlightMode === 'diff') {
    if (isUnique) return '#f59e0b' // Amber/gold for unique substituents
    return '#475569' // Dimmed for common
  }
  // Standard CPK
  return ELEMENT_METRICS[element]?.color || '#94a3b8'
}

export default function SideBySide2DViewer({
  compoundA,
  compoundB,
  mcs,
  differences,
}) {
  const [highlightMode, setHighlightMode] = useState('mcs') // 'mcs' | 'diff' | 'standard'
  const [showLabels, setShowLabels] = useState(true)
  const [showIndices, setShowIndices] = useState(false)
  const [hoveredAtomA, setHoveredAtomA] = useState(null)
  const [hoveredAtomB, setHoveredAtomB] = useState(null)

  const canvasRefA = useRef(null)
  const canvasRefB = useRef(null)

  // Zoom & Pan state for viewport A and B
  const [viewA, setViewA] = useState({ zoom: 1, panX: 0, panY: 0, rotation: 0 })
  const [viewB, setViewB] = useState({ zoom: 1, panX: 0, panY: 0, rotation: 0 })
  const [syncViews, setSyncViews] = useState(true)

  // Interaction dragging
  const dragRefA = useRef({ dragging: false, startX: 0, startY: 0 })
  const dragRefB = useRef({ dragging: false, startX: 0, startY: 0 })

  // Common atom sets
  const commonAtomsSetA = useMemo(() => {
    return new Set(mcs?.commonAtomsA || [])
  }, [mcs])

  const commonAtomsSetB = useMemo(() => {
    return new Set(mcs?.commonAtomsB || [])
  }, [mcs])

  // Mapping lookup: A -> B and B -> A
  const mapAtoB = useMemo(() => {
    const map = new Map()
    if (mcs?.atomMap) {
      mcs.atomMap.forEach(([aIdx, bIdx]) => map.set(aIdx, bIdx))
    }
    return map
  }, [mcs])

  const mapBtoA = useMemo(() => {
    const map = new Map()
    if (mcs?.atomMap) {
      mcs.atomMap.forEach(([aIdx, bIdx]) => map.set(bIdx, aIdx))
    }
    return map
  }, [mcs])

  // Reset viewport helper
  const handleReset = () => {
    setViewA({ zoom: 1, panX: 0, panY: 0, rotation: 0 })
    setViewB({ zoom: 1, panX: 0, panY: 0, rotation: 0 })
  }

  // Draw Molecule function
  const renderMolecule2D = (
    canvas,
    compound,
    isCompoundA,
    viewState,
    hoveredIndex,
    partnerHoveredIndex
  ) => {
    if (!canvas || !compound || !compound.atoms) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    // Compute bounding box
    const atoms = compound.atoms
    if (atoms.length === 0) return

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    atoms.forEach((a) => {
      const x = Number(a.x) || 0
      const y = Number(a.y) || 0
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    })

    const spanX = Math.max(maxX - minX, 1.2)
    const spanY = Math.max(maxY - minY, 1.2)
    const autoScale = Math.min((width * 0.7) / spanX, (height * 0.7) / spanY)
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Apply transformation
    ctx.save()
    ctx.translate(width / 2 + viewState.panX, height / 2 + viewState.panY)
    ctx.scale(viewState.zoom, viewState.zoom)
    ctx.rotate(viewState.rotation)

    // Coordinate projection
    const project = (atom) => {
      const ax = (Number(atom.x) || 0) - centerX
      const ay = -((Number(atom.y) || 0) - centerY) // flip Y for screen
      return {
        x: ax * autoScale,
        y: ay * autoScale,
      }
    }

    const projectedAtoms = atoms.map((a, i) => ({
      ...a,
      index: a.index ?? i,
      proj: project(a),
    }))

    // Draw Bonds
    const bonds = compound.bonds || []
    bonds.forEach((bond) => {
      const fromAtom = projectedAtoms.find((a) => a.index === bond.from)
      const toAtom = projectedAtoms.find((a) => a.index === bond.to)
      if (!fromAtom || !toAtom) return

      const isCommonA = commonAtomsSetA.has(fromAtom.index) && commonAtomsSetA.has(toAtom.index)
      const isCommonB = commonAtomsSetB.has(fromAtom.index) && commonAtomsSetB.has(toAtom.index)
      const isCommon = isCompoundA ? isCommonA : isCommonB

      let strokeColor = '#334155'
      let lineWidth = 2

      if (highlightMode === 'mcs') {
        if (isCommon) {
          strokeColor = '#10b981'
          lineWidth = 3
        } else {
          strokeColor = '#1e293b'
          lineWidth = 1.5
        }
      } else if (highlightMode === 'diff') {
        if (!isCommon) {
          strokeColor = '#f59e0b'
          lineWidth = 3
        } else {
          strokeColor = '#1e293b'
          lineWidth = 1.5
        }
      }

      ctx.beginPath()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'

      const x1 = fromAtom.proj.x
      const y1 = fromAtom.proj.y
      const x2 = toAtom.proj.x
      const y2 = toAtom.proj.y

      const order = Number(bond.order) || 1
      if (order === 1) {
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      } else if (order === 2) {
        // Double bond: two parallel lines
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy) || 1
        const offX = (-dy / len) * 3.5
        const offY = (dx / len) * 3.5
        ctx.moveTo(x1 + offX, y1 + offY)
        ctx.lineTo(x2 + offX, y2 + offY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x1 - offX, y1 - offY)
        ctx.lineTo(x2 - offX, y2 - offY)
        ctx.stroke()
      } else if (order >= 3) {
        // Triple bond
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy) || 1
        const offX = (-dy / len) * 4.5
        const offY = (dx / len) * 4.5
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x1 + offX, y1 + offY)
        ctx.lineTo(x2 + offX, y2 + offY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x1 - offX, y1 - offY)
        ctx.lineTo(x2 - offX, y2 - offY)
        ctx.stroke()
      }
    })

    // Draw Atoms
    projectedAtoms.forEach((atom) => {
      const idx = atom.index
      const isCommon = isCompoundA ? commonAtomsSetA.has(idx) : commonAtomsSetB.has(idx)
      const isUnique = !isCommon
      const isHovered = hoveredIndex === idx || partnerHoveredIndex === idx

      const atomColor = getAtomColor(atom.element, isCommon, isUnique, highlightMode)
      const radius = isHovered ? 11 : isCommon && highlightMode === 'mcs' ? 8.5 : 7

      // Glow halo for common atoms or hovered atoms
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(atom.proj.x, atom.proj.y, radius + 6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'
        ctx.fill()
      } else if (isCommon && highlightMode === 'mcs') {
        ctx.beginPath()
        ctx.arc(atom.proj.x, atom.proj.y, radius + 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'
        ctx.fill()
      } else if (isUnique && highlightMode === 'diff') {
        ctx.beginPath()
        ctx.arc(atom.proj.x, atom.proj.y, radius + 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'
        ctx.fill()
      }

      // Main circle
      ctx.beginPath()
      ctx.arc(atom.proj.x, atom.proj.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = atomColor
      ctx.fill()
      ctx.strokeStyle = isHovered ? '#38bdf8' : '#0f172a'
      ctx.lineWidth = isHovered ? 2 : 1.2
      ctx.stroke()

      // Atom Symbol & Index
      if (showLabels) {
        ctx.fillStyle = atom.element === 'H' ? '#0f172a' : '#ffffff'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(atom.element, atom.proj.x, atom.proj.y)
      }

      if (showIndices) {
        ctx.fillStyle = '#94a3b8'
        ctx.font = '8px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(`${idx}`, atom.proj.x + 8, atom.proj.y - 8)
      }
    })

    ctx.restore()
  }

  // Effect to re-render Canvas A & B
  useEffect(() => {
    const partnerHoverForA = hoveredAtomB !== null ? mapBtoA.get(hoveredAtomB) : null
    renderMolecule2D(canvasRefA.current, compoundA, true, viewA, hoveredAtomA, partnerHoverForA)
  }, [compoundA, viewA, highlightMode, showLabels, showIndices, hoveredAtomA, hoveredAtomB, mcs])

  useEffect(() => {
    const partnerHoverForB = hoveredAtomA !== null ? mapAtoB.get(hoveredAtomA) : null
    renderMolecule2D(canvasRefB.current, compoundB, false, viewB, hoveredAtomB, partnerHoverForB)
  }, [compoundB, viewB, highlightMode, showLabels, showIndices, hoveredAtomB, hoveredAtomA, mcs])

  // Mouse wheel zoom
  const handleWheel = (e, isA) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    const updater = (prev) => ({
      ...prev,
      zoom: Math.min(2.5, Math.max(0.5, prev.zoom + delta)),
    })
    if (syncViews) {
      setViewA(updater)
      setViewB(updater)
    } else if (isA) {
      setViewA(updater)
    } else {
      setViewB(updater)
    }
  }

  // Pointer drag panning
  const handlePointerDown = (e, isA) => {
    const ref = isA ? dragRefA : dragRefB
    ref.current = { dragging: true, startX: e.clientX, startY: e.clientY }
  }

  const handlePointerMove = (e, isA) => {
    const ref = isA ? dragRefA : dragRefB
    if (!ref.current.dragging) {
      // Check atom hover
      const canvas = isA ? canvasRefA.current : canvasRefB.current
      const compound = isA ? compoundA : compoundB
      if (!canvas || !compound || !compound.atoms) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const view = isA ? viewA : viewB

      const width = canvas.width
      const height = canvas.height
      const atoms = compound.atoms
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      atoms.forEach((a) => {
        const x = Number(a.x) || 0
        const y = Number(a.y) || 0
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      })
      const spanX = Math.max(maxX - minX, 1.2)
      const spanY = Math.max(maxY - minY, 1.2)
      const autoScale = Math.min((width * 0.7) / spanX, (height * 0.7) / spanY)
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      let closestAtom = null
      let minDist = 18

      atoms.forEach((atom, i) => {
        const idx = atom.index ?? i
        const ax = (Number(atom.x) || 0) - centerX
        const ay = -((Number(atom.y) || 0) - centerY)
        const rad = view.rotation
        const rotX = ax * Math.cos(rad) - ay * Math.sin(rad)
        const rotY = ax * Math.sin(rad) + ay * Math.cos(rad)
        const sx = width / 2 + view.panX + rotX * autoScale * view.zoom
        const sy = height / 2 + view.panY + rotY * autoScale * view.zoom

        const dist = Math.hypot(mouseX - sx, mouseY - sy)
        if (dist < minDist) {
          minDist = dist
          closestAtom = idx
        }
      })

      if (isA) setHoveredAtomA(closestAtom)
      else setHoveredAtomB(closestAtom)
      return
    }

    const dx = e.clientX - ref.current.startX
    const dy = e.clientY - ref.current.startY
    ref.current = { dragging: true, startX: e.clientX, startY: e.clientY }

    const updater = (prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    })

    if (syncViews) {
      setViewA(updater)
      setViewB(updater)
    } else if (isA) {
      setViewA(updater)
    } else {
      setViewB(updater)
    }
  }

  const handlePointerUp = (isA) => {
    const ref = isA ? dragRefA : dragRefB
    ref.current.dragging = false
  }

  const handleRotate = (angleDelta) => {
    setViewA((prev) => ({ ...prev, rotation: prev.rotation + angleDelta }))
    setViewB((prev) => ({ ...prev, rotation: prev.rotation + angleDelta }))
  }

  return (
    <div className="comparison-2d-viewport-wrapper">
      {/* Controls Bar */}
      <div className="comparison-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">
            <Layers size={14} /> Substructure Highlight:
          </span>
          <button
            className={`tool-button ${highlightMode === 'mcs' ? 'active green' : ''}`}
            onClick={() => setHighlightMode('mcs')}
            title="Highlight Maximum Common Substructure (Shared Core)"
          >
            <span className="dot-indicator green" /> Common Core (MCS)
          </button>
          <button
            className={`tool-button ${highlightMode === 'diff' ? 'active amber' : ''}`}
            onClick={() => setHighlightMode('diff')}
            title="Highlight Unique Substituents and Differences"
          >
            <span className="dot-indicator amber" /> Unique Substituents
          </button>
          <button
            className={`tool-button ${highlightMode === 'standard' ? 'active' : ''}`}
            onClick={() => setHighlightMode('standard')}
          >
            All Atoms (CPK)
          </button>
        </div>

        <div className="toolbar-group right">
          <label className="checkbox-toggle" title="Synchronize Pan and Zoom across both molecules">
            <input
              type="checkbox"
              checked={syncViews}
              onChange={(e) => setSyncViews(e.target.checked)}
            />
            <span>Sync Viewport</span>
          </label>

          <label className="checkbox-toggle">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            <span>Element Labels</span>
          </label>

          <label className="checkbox-toggle">
            <input
              type="checkbox"
              checked={showIndices}
              onChange={(e) => setShowIndices(e.target.checked)}
            />
            <span>Atom Indices</span>
          </label>

          <div className="icon-actions">
            <button
              className="icon-tool-btn"
              onClick={() => handleRotate(Math.PI / 12)}
              title="Rotate 15° clockwise"
            >
              <RotateCcw size={15} style={{ transform: 'scaleX(-1)' }} />
            </button>
            <button
              className="icon-tool-btn"
              onClick={() => handleRotate(-Math.PI / 12)}
              title="Rotate 15° counter-clockwise"
            >
              <RotateCcw size={15} />
            </button>
            <button className="icon-tool-btn" onClick={handleReset} title="Reset views">
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Viewport */}
      <div className="dual-canvas-grid">
        {/* Molecule A Container */}
        <div className="molecule-view-box">
          <div className="view-header">
            <div className="badge-identity">
              <span className="molecule-badge a">COMPOUND A</span>
              <strong className="molecule-title">{compoundA.name || 'Compound A'}</strong>
              <small className="formula-tag">{compoundA.formula || ''}</small>
            </div>
            <div className="status-indicators">
              <span className="stat-pill">
                {compoundA.atoms?.length || 0} atoms · {compoundA.bonds?.length || 0} bonds
              </span>
            </div>
          </div>

          <div
            className="canvas-container"
            onWheel={(e) => handleWheel(e, true)}
            onPointerDown={(e) => handlePointerDown(e, true)}
            onPointerMove={(e) => handlePointerMove(e, true)}
            onPointerUp={() => handlePointerUp(true)}
            onPointerLeave={() => {
              handlePointerUp(true)
              setHoveredAtomA(null)
            }}
          >
            <canvas ref={canvasRefA} width={460} height={360} className="structure-canvas" />

            {/* Hover tooltip for A */}
            {hoveredAtomA !== null && (
              <div className="canvas-tooltip">
                <strong>Atom {hoveredAtomA}: {compoundA.atoms?.[hoveredAtomA]?.element}</strong>
                {mapAtoB.has(hoveredAtomA) ? (
                  <span className="mapped-badge">
                    <Check size={11} /> Corresponds to Atom {mapAtoB.get(hoveredAtomA)} in Compound B
                  </span>
                ) : (
                  <span className="unique-badge">Substituent unique to Compound A</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Molecule B Container */}
        <div className="molecule-view-box">
          <div className="view-header">
            <div className="badge-identity">
              <span className="molecule-badge b">COMPOUND B</span>
              <strong className="molecule-title">{compoundB.name || 'Compound B'}</strong>
              <small className="formula-tag">{compoundB.formula || ''}</small>
            </div>
            <div className="status-indicators">
              <span className="stat-pill">
                {compoundB.atoms?.length || 0} atoms · {compoundB.bonds?.length || 0} bonds
              </span>
            </div>
          </div>

          <div
            className="canvas-container"
            onWheel={(e) => handleWheel(e, false)}
            onPointerDown={(e) => handlePointerDown(e, false)}
            onPointerMove={(e) => handlePointerMove(e, false)}
            onPointerUp={() => handlePointerUp(false)}
            onPointerLeave={() => {
              handlePointerUp(false)
              setHoveredAtomB(null)
            }}
          >
            <canvas ref={canvasRefB} width={460} height={360} className="structure-canvas" />

            {/* Hover tooltip for B */}
            {hoveredAtomB !== null && (
              <div className="canvas-tooltip">
                <strong>Atom {hoveredAtomB}: {compoundB.atoms?.[hoveredAtomB]?.element}</strong>
                {mapBtoA.has(hoveredAtomB) ? (
                  <span className="mapped-badge">
                    <Check size={11} /> Corresponds to Atom {mapBtoA.get(hoveredAtomB)} in Compound A
                  </span>
                ) : (
                  <span className="unique-badge added">Added substituent in Compound B</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend & Guide Bar */}
      <div className="comparison-legend">
        <div className="legend-item">
          <span className="legend-swatch emerald-core" />
          <span>Maximum Common Substructure (Shared scaffold)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch amber-diff" />
          <span>Unique substituent modification (Δ in Compound B)</span>
        </div>
        <div className="legend-note">
          <Info size={13} />
          <span>Hover over any atom to inspect its one-to-one mapping in the partner structure.</span>
        </div>
      </div>
    </div>
  )
}
