import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Atom,
  ArrowUpRight,
  Beaker,
  CheckCircle2,
  ChevronRight,
  Eye,
  Flame,
  Gauge,
  Layers3,
  MapPinned,
  Orbit,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Wand2,
  ZoomIn,
} from 'lucide-react'
import { autocompleteCompoundQuery, resolveCompoundQuery } from '../../services/api'

const EXAMPLE_QUERIES = ['Benzene', 'Methanol', 'Glucose', 'Caffeine', 'Aspirin']

const FALLBACK_COMPOUNDS = {
  benzene: {
    id: 'fallback-benzene',
    name: 'Benzene',
    iupacName: 'Benzene',
    formula: 'C6H6',
    molecularWeight: 78.11,
    smiles: 'C1=CC=CC=C1',
    canonicalSmiles: 'C1=CC=CC=C1',
    isomericSmiles: 'C1=CC=CC=C1',
    inchi: 'InChI=1S/C6H6/c1-2-4-6-5-3-1/h1-6H',
    inchikey: 'UHOVQNZJYSORNB-UHFFFAOYSA-N',
    properties: {
      logP: 2.13,
      tpsa: 0,
      hbd: 0,
      hba: 0,
      rotatableBonds: 0,
      heavyAtomCount: 6,
      ringCount: 1,
      aromaticRingCount: 1,
    },
    structureSource: 'Local fallback reference profile',
    structureType: 'Computationally generated',
    atoms: [
      { index: 0, element: 'C', x: -1.4, y: 0.0, z: 0.0 },
      { index: 1, element: 'C', x: -0.7, y: 1.2, z: 0.0 },
      { index: 2, element: 'C', x: 0.7, y: 1.2, z: 0.0 },
      { index: 3, element: 'C', x: 1.4, y: 0.0, z: 0.0 },
      { index: 4, element: 'C', x: 0.7, y: -1.2, z: 0.0 },
      { index: 5, element: 'C', x: -0.7, y: -1.2, z: 0.0 },
      { index: 6, element: 'H', x: -2.4, y: 0.0, z: 0.0 },
      { index: 7, element: 'H', x: -1.2, y: 2.2, z: 0.0 },
      { index: 8, element: 'H', x: 1.2, y: 2.2, z: 0.0 },
      { index: 9, element: 'H', x: 2.4, y: 0.0, z: 0.0 },
      { index: 10, element: 'H', x: 1.2, y: -2.2, z: 0.0 },
      { index: 11, element: 'H', x: -1.2, y: -2.2, z: 0.0 },
    ],
    bonds: [
      { index: 0, from: 0, to: 1, order: 2 },
      { index: 1, from: 1, to: 2, order: 1 },
      { index: 2, from: 2, to: 3, order: 2 },
      { index: 3, from: 3, to: 4, order: 1 },
      { index: 4, from: 4, to: 5, order: 2 },
      { index: 5, from: 5, to: 0, order: 1 },
      { index: 6, from: 0, to: 6, order: 1 },
      { index: 7, from: 1, to: 7, order: 1 },
      { index: 8, from: 2, to: 8, order: 1 },
      { index: 9, from: 3, to: 9, order: 1 },
      { index: 10, from: 4, to: 10, order: 1 },
      { index: 11, from: 5, to: 11, order: 1 },
    ],
    topology: {
      rings: [{ id: 'ring-1', size: 6, isAromatic: true, atomIndices: [0, 1, 2, 3, 4, 5] }],
      mainChain: [0, 1, 2, 3, 4, 5],
      branchPoints: [],
      functionalGroups: [{ type: 'Aromatic', name: 'Aromatic Ring', atomIndices: [0, 1, 2, 3, 4, 5] }],
    },
    education: {
      summary: 'Benzene is a six-membered aromatic hydrocarbon with a conjugated ring system.',
      structuralNature: 'This molecule is aromatic and planar, with delocalized electrons around the ring.',
      bondingDescription: 'The carbon atoms are connected by alternating bond orders with a stable aromatic framework.',
    },
    source: 'Local fallback reference profile',
    isFallback: true,
  },
}

function getFallbackCompound(query) {
  const normalized = String(query).trim().toLowerCase()
  const match = FALLBACK_COMPOUNDS[normalized]
  if (match) return match

  return {
    id: `fallback-${normalized || 'compound'}`,
    name: query || 'Compound',
    iupacName: query || 'Compound',
    formula: 'Unknown',
    molecularWeight: null,
    smiles: '',
    canonicalSmiles: '',
    isomericSmiles: '',
    inchi: '',
    inchikey: '',
    properties: {
      logP: null,
      tpsa: null,
      hbd: null,
      hba: null,
      rotatableBonds: null,
      heavyAtomCount: null,
      ringCount: null,
      aromaticRingCount: null,
    },
    structureSource: 'No authoritative structure available',
    structureType: 'Unavailable',
    source: 'Local reference only',
    topology: {
      rings: [],
      mainChain: [],
      branchPoints: [],
      functionalGroups: [],
    },
    education: {
      summary: 'This compound could not be resolved with sufficient confidence from the current chemical data sources.',
      structuralNature: 'A more specific name, SMILES, InChI, or CAS number is recommended.',
      bondingDescription: 'No reliable structure trace is available yet.',
    },
    isFallback: true,
  }
}

function getElementColor(element) {
  const palette = {
    C: '#475569',
    H: '#f8fafc',
    O: '#ef4444',
    N: '#38bdf8',
    S: '#eab308',
    P: '#f97316',
    F: '#22c55e',
    Cl: '#10b981',
    Br: '#b91c1c',
    I: '#7e22ce',
    default: '#ec4899',
  }
  return palette[element] || palette.default
}

function getPropertyDisplay(value, unit = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not available'
  return `${value}${unit}`
}

function getAtomList(compound) {
  if (Array.isArray(compound?.atoms) && compound.atoms.length > 0) return compound.atoms
  return [
    { index: 0, element: 'C', x: -1.2, y: 0.2, z: 0 },
    { index: 1, element: 'C', x: 1.2, y: 0.2, z: 0 },
    { index: 2, element: 'O', x: 0, y: -1.3, z: 0.8 },
  ]
}

function getBondList(compound) {
  if (Array.isArray(compound?.bonds) && compound.bonds.length > 0) return compound.bonds
  return [
    { index: 0, from: 0, to: 1, order: 1 },
    { index: 1, from: 1, to: 2, order: 1 },
  ]
}

function readStoredHistory() {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem('aegis-visualized-compounds')
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

function readStoredFavorites() {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem('aegis-favorite-compounds')
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

export default function VisualizeCompoundView({ setNotice }) {
  const [query, setQuery] = useState('benzene')
  const [term, setTerm] = useState('benzene')
  const [compound, setCompound] = useState(getFallbackCompound('benzene'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [representation, setRepresentation] = useState('ball-and-stick')
  const [showLabels, setShowLabels] = useState(true)
  const [showBonds, setShowBonds] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [learningMode, setLearningMode] = useState(true)
  const [researchMode, setResearchMode] = useState(false)
  const [history, setHistory] = useState(readStoredHistory)
  const [favorites, setFavorites] = useState(readStoredFavorites)
  const [hoveredAtom, setHoveredAtom] = useState(null)
  const [rotation, setRotation] = useState({ x: 0.75, y: 1.3 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aegis-visualized-compounds', JSON.stringify(history.slice(0, 8)))
    }
  }, [history])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aegis-favorite-compounds', JSON.stringify(favorites.slice(0, 8)))
    }
  }, [favorites])

  const structureTabs = useMemo(() => [
    'Overview',
    'Chain Structure',
    'Branch Structure',
    'Ring Structure',
    'Aromatic Structure',
    'Functional Groups',
    'Atom Map',
    'Bond Map',
    'Molecular Graph',
  ], [])

  const loadCompound = async (rawQuery) => {
    const nextQuery = String(rawQuery || '').trim()
    if (!nextQuery) {
      setError('Please enter a compound name, formula, SMILES, or identifier.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await resolveCompoundQuery(nextQuery)
      const item = response?.compound || response?.results?.[0] || getFallbackCompound(nextQuery)
      const normalized = {
        ...item,
        name: item.name || item.iupacName || nextQuery,
        source: item.source || 'PubChem / RDKit-compatible resolver',
      }
      setCompound(normalized)
      setQuery(nextQuery)
      setTerm(nextQuery)
      setHistory((prev) => {
        const next = [normalized.name, ...prev.filter((entry) => entry !== normalized.name)].slice(0, 8)
        return next
      })
      if (setNotice) setNotice(`Loaded ${normalized.name}`)
    } catch (errorObject) {
      const fallback = getFallbackCompound(nextQuery)
      setCompound(fallback)
      setError(errorObject?.message || 'The compound could not be resolved with sufficient confidence.')
      setQuery(nextQuery)
      setTerm(nextQuery)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCompound('benzene')
  }, [])

  useEffect(() => {
    if (!autoRotate || !canvasRef.current || !compound) return

    let frameId = 0
    const tick = () => {
      setRotation((prev) => ({ ...prev, y: prev.y + 0.011 }))
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [autoRotate, compound])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !compound) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width = 620
    const height = canvas.height = 320
    const atoms = getAtomList(compound)
    const bonds = getBondList(compound)
    const centerX = width / 2
    const centerY = height / 2

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#11261e'
    ctx.fillRect(0, 0, width, height)

    const projected = atoms.map((atom) => {
      const x = Number(atom.x) || 0
      const y = Number(atom.y) || 0
      const z = Number(atom.z) || 0
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const x1 = x * cosY + z * sinY
      const z1 = -x * sinY + z * cosY
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX
      const f = 4.8
      const scale = f / (f + z2 + 2.4)
      return {
        ...atom,
        screenX: centerX + x1 * 72 * zoom * scale,
        screenY: centerY + y1 * 72 * zoom * scale,
        scale,
      }
    })

    if (showBonds) {
      bonds.forEach((bond) => {
        const from = projected[bond.from]
        const to = projected[bond.to]
        if (!from || !to) return
        ctx.beginPath()
        ctx.moveTo(from.screenX, from.screenY)
        ctx.lineTo(to.screenX, to.screenY)
        ctx.strokeStyle = 'rgba(167, 204, 185, 0.8)'
        ctx.lineWidth = bond.order === 2 ? 2.8 : bond.order === 3 ? 3.6 : 2.2
        ctx.stroke()
      })
    }

    projected.forEach((atom) => {
      const radius = representation === 'space-filling' ? 14 + (Number(atom.scale) || 1) * 10 : 8
      const grad = ctx.createRadialGradient(
        atom.screenX - radius * 0.4,
        atom.screenY - radius * 0.4,
        2,
        atom.screenX,
        atom.screenY,
        radius
      )
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.35, getElementColor(atom.element))
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(atom.screenX, atom.screenY, radius, 0, Math.PI * 2)
      ctx.fill()

      if (showLabels) {
        ctx.fillStyle = '#eafcf6'
        ctx.font = '12px sans-serif'
        ctx.fillText(atom.element || 'C', atom.screenX - 4, atom.screenY + 4)
      }
    })
  }, [compound, representation, showBonds, showLabels, rotation])

  const onCanvasMove = (event) => {
    const canvas = canvasRef.current
    if (!canvas || !compound) return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const atoms = getAtomList(compound)
    let nearest = null
    let nearestDistance = Number.POSITIVE_INFINITY

    atoms.forEach((atom) => {
      const x2 = Number(atom.x) || 0
      const y2 = Number(atom.y) || 0
      const z2 = Number(atom.z) || 0
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const x1 = x2 * cosY + z2 * sinY
      const z1 = -x2 * sinY + z2 * cosY
      const y1 = y2 * cosX - z1 * sinX
      const z3 = y2 * sinX + z1 * cosX
      const f = 4.8
      const scale = f / (f + z3 + 2.4)
      const screenX = 310 + x1 * 72 * zoom * scale
      const screenY = 160 + y1 * 72 * zoom * scale
      const distance = Math.hypot(screenX - x, screenY - y)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = atom
      }
    })

    if (nearest && nearestDistance < 32) {
      setHoveredAtom(nearest)
    } else {
      setHoveredAtom(null)
    }
  }

  const selectedStructure = compound?.topology || {}
  const propertyCards = [
    { label: 'Molecular Weight', value: getPropertyDisplay(compound?.molecularWeight || compound?.properties?.molecularWeight, ' g/mol') },
    { label: 'Formula', value: compound?.formula || 'Unknown' },
    { label: 'LogP', value: getPropertyDisplay(compound?.properties?.logP, '') },
    { label: 'TPSA', value: getPropertyDisplay(compound?.properties?.tpsa, ' Å²') },
    { label: 'H-Bond Donors', value: getPropertyDisplay(compound?.properties?.hbd, '') },
    { label: 'H-Bond Acceptors', value: getPropertyDisplay(compound?.properties?.hba, '') },
    { label: 'Rotatable Bonds', value: getPropertyDisplay(compound?.properties?.rotatableBonds, '') },
    { label: 'Heavy Atoms', value: getPropertyDisplay(compound?.properties?.heavyAtomCount, '') },
    { label: 'Ring Count', value: getPropertyDisplay(compound?.properties?.ringCount, '') },
    { label: 'Formal Charge', value: getPropertyDisplay(compound?.properties?.formalCharge, '') },
    { label: 'Exact Mass', value: getPropertyDisplay(compound?.properties?.exactMass, ' Da') },
  ]

  const toggleFavorite = () => {
    if (!compound) return
    const name = compound.name || compound.iupacName || query
    setFavorites((prev) => {
      if (prev.includes(name)) return prev
      return [name, ...prev].slice(0, 8)
    })
    if (setNotice) setNotice(`${name} saved to favorites`)
  }

  const isFavorite = compound ? favorites.includes(compound.name || compound.iupacName || query) : false

  const handlePointerDown = (event) => {
    setIsDragging(true)
    dragStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerMove = (event) => {
    if (!isDragging) return
    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y
    dragStartRef.current = { x: event.clientX, y: event.clientY }
    setRotation((prev) => ({
      x: Math.max(-Math.PI, Math.min(Math.PI, prev.x + dy * 0.008)),
      y: prev.y + dx * 0.008,
    }))
  }

  const handlePointerUp = () => setIsDragging(false)

  const handleWheel = (event) => {
    event.preventDefault()
    setZoom((prev) => Math.min(1.9, Math.max(0.7, prev + (event.deltaY > 0 ? -0.08 : 0.08))))
  }

  return (
    <div className="page-wrap compound-visualizer-shell">
      <div className="page-intro compound-intro">
        <div>
          <p className="eyebrow">Computational chemistry</p>
          <h1>Visualize the Compound</h1>
          <p className="intro-copy">Resolve a molecule by name, formula, SMILES, or identifier and inspect structure, properties, and 3D chemistry interactively.</p>
        </div>
        <button className="primary-button small" onClick={() => loadCompound(term)}>
          <Search size={15} /> Search compound
        </button>
      </div>

      <section className="compound-search-card">
        <div className="search-stack">
          <label className="search-label" htmlFor="compound-search">Enter a compound</label>
          <div className="compound-search-box">
            <Search size={16} />
            <input
              id="compound-search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') loadCompound(term)
              }}
              placeholder="Search by name, formula, SMILES, CAS, or PubChem ID"
              aria-label="Search for a compound"
            />
            <button className="primary-button small" onClick={() => loadCompound(term)}>
              Visualize
            </button>
          </div>
        </div>

        <div className="example-row">
          <span>Try:</span>
          {EXAMPLE_QUERIES.map((example) => (
            <button key={example} className="ghost-chip" onClick={() => loadCompound(example)}>
              {example}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="compound-loading-shell" role="status" aria-live="polite">
          <div className="compound-loading-bar" style={{ width: '75%' }} />
          <div className="compound-loading-copy">
            <strong>Resolving compound…</strong>
            <span>Preparing structure, properties, and molecular workspace</span>
          </div>
        </div>
      )}

      {error && (
        <div className="compound-alert">
          <ShieldCheck size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="molecule-workspace">
        <div className="viewer-panel glass-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Interactive molecular viewer</p>
              <h3>{compound?.name || 'Compound'}</h3>
            </div>
            <div className="header-actions">
              <button className="quiet-button" onClick={toggleFavorite} aria-label="Save compound as favorite">
                <Star size={14} fill={isFavorite ? '#fbbf24' : 'none'} /> {isFavorite ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <div className="viewer-toolbar">
            <div className="representation-picker">
              {['ball-and-stick', 'space-filling', 'stick', 'wireframe'].map((mode) => (
                <button
                  key={mode}
                  className={representation === mode ? 'toolbar-button active' : 'toolbar-button'}
                  onClick={() => setRepresentation(mode)}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div className="toolbar-group">
              <button className="icon-button" aria-label="Reset view" onClick={() => setRotation({ x: 0.75, y: 1.3 })}><RotateCcw size={15} /></button>
              <button className="icon-button" aria-label="Zoom in"><ZoomIn size={15} /></button>
              <button className="icon-button" aria-label="Center molecule"><MapPinned size={15} /></button>
              <button className="icon-button" aria-label="Toggle auto rotate" onClick={() => setAutoRotate((prev) => !prev)}><Orbit size={15} /></button>
            </div>
          </div>

          <div className="viewer-stage">
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={(event) => {
                onCanvasMove(event)
                handlePointerMove(event)
              }}
              onMouseUp={handlePointerUp}
              onMouseLeave={() => {
                setHoveredAtom(null)
                handlePointerUp()
              }}
              onWheel={handleWheel}
              aria-label="3D molecular visualization canvas"
            />
            <div className="viewer-caption">
              <span>{compound?.structureType || 'Structure'} · {compound?.structureSource || 'Source unavailable'}</span>
              <span>{autoRotate ? 'Auto rotate: on' : 'Auto rotate: off'}</span>
            </div>
          </div>

          {hoveredAtom && (
            <div className="atom-hover-card">
              <strong>{hoveredAtom.element || 'Atom'}</strong>
              <span>Element: {hoveredAtom.element}</span>
              <span>Index: {hoveredAtom.index}</span>
            </div>
          )}
        </div>

        <aside className="info-panel glass-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Compound information</p>
              <h3>Identity & properties</h3>
            </div>
          </div>

          <div className="identity-grid">
            <div><label>Name</label><strong>{compound?.name || 'Unknown'}</strong></div>
            <div><label>IUPAC</label><strong>{compound?.iupacName || 'Not available'}</strong></div>
            <div><label>Formula</label><strong>{compound?.formula || 'Unknown'}</strong></div>
            <div><label>Molecular weight</label><strong>{getPropertyDisplay(compound?.molecularWeight || compound?.properties?.molecularWeight, ' g/mol')}</strong></div>
            <div><label>CAS</label><strong>{compound?.casNumber || 'Not available'}</strong></div>
            <div><label>PubChem CID</label><strong>{compound?.pubchemId || compound?.id || 'Not available'}</strong></div>
            <div className="full-width"><label>Canonical SMILES</label><strong>{compound?.canonicalSmiles || compound?.smiles || 'Not available'}</strong></div>
            <div className="full-width"><label>InChI</label><strong>{compound?.inchi || 'Not available'}</strong></div>
          </div>

          <div className="property-grid">
            {propertyCards.map((card) => (
              <div key={card.label} className="property-card">
                <small>{card.label}</small>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="analysis-grid">
        <section className="glass-panel structure-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Structure explorer</p>
              <h3>Topology analysis</h3>
            </div>
            <div className="mode-toggle-row">
              <button className={learningMode ? 'toggle active' : 'toggle'} onClick={() => setLearningMode((prev) => !prev)}>Learning mode</button>
              <button className={researchMode ? 'toggle active' : 'toggle'} onClick={() => setResearchMode((prev) => !prev)}>Research mode</button>
            </div>
          </div>

          <div className="tab-row">
            {structureTabs.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'tab-pill active' : 'tab-pill'} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'Overview' && (
              <div className="analysis-copy">
                <p>{compound?.education?.summary || 'Compound information is not available yet.'}</p>
                <p>{compound?.education?.structuralNature || 'A reliable molecular description will appear once the structure has been resolved.'}</p>
              </div>
            )}

            {activeTab === 'Chain Structure' && (
              <div className="analysis-copy">
                <p>Main chain:</p>
                <strong>{selectedStructure.mainChain?.length ? selectedStructure.mainChain.map((idx) => `C${idx + 1}`).join(' — ') : 'No simple carbon chain detected for this structure.'}</strong>
              </div>
            )}

            {activeTab === 'Branch Structure' && (
              <div className="analysis-copy">
                <p>Branch points:</p>
                <strong>{selectedStructure.branchPoints?.length ? selectedStructure.branchPoints.map((point) => `C${point.atomIndex + 1}`).join(', ') : 'No major branching points detected.'}</strong>
              </div>
            )}

            {activeTab === 'Ring Structure' && (
              <div className="analysis-copy">
                <p>Ring systems:</p>
                <strong>{selectedStructure.rings?.length ? selectedStructure.rings.map((ring) => `${ring.size}-membered ${ring.isAromatic ? 'aromatic' : 'saturated'} ring`).join(' • ') : 'No closed ring system detected.'}</strong>
              </div>
            )}

            {activeTab === 'Aromatic Structure' && (
              <div className="analysis-copy">
                <p>Aromatic detection:</p>
                <strong>{selectedStructure.rings?.some((ring) => ring.isAromatic) ? 'Aromatic ring system present.' : 'No aromatic ring is detected in the current structure.'}</strong>
              </div>
            )}

            {activeTab === 'Functional Groups' && (
              <ul className="pill-list">
                {(selectedStructure.functionalGroups?.length ? selectedStructure.functionalGroups : [{ type: 'No functional groups detected', name: 'No functional groups detected' }]).map((group, index) => (
                  <li key={`${group.type || 'group'}-${index}`}>
                    <CheckCircle2 size={14} />
                    <span>{group.type || group.name || 'Functional group'}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'Atom Map' && (
              <ul className="pill-list compact-list">
                {getAtomList(compound).map((atom) => (
                  <li key={`${atom.index}-${atom.element}`}>
                    <span className="atom-dot" style={{ background: getElementColor(atom.element) }} />
                    <span>{atom.element} · atom {atom.index}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'Bond Map' && (
              <ul className="pill-list compact-list">
                {getBondList(compound).map((bond) => (
                  <li key={`${bond.from}-${bond.to}`}>
                    <span className="bond-dot" />
                    <span>{bond.from} — {bond.to} · order {bond.order || 1}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'Molecular Graph' && (
              <div className="graph-legend">
                <span>Atoms → nodes</span>
                <span>Bonds → edges</span>
                <span>Connectivity view enabled</span>
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel detail-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Understand this molecule</p>
              <h3>Educational summary</h3>
            </div>
          </div>

          <div className="educational-block">
            <div className="edu-card">
              <h4>What is it?</h4>
              <p>{compound?.education?.summary || 'The structure definition is still being resolved.'}</p>
            </div>
            <div className="edu-card">
              <h4>How are the atoms connected?</h4>
              <p>{compound?.education?.bondingDescription || 'Structure connectivity will appear with a valid molecular search.'}</p>
            </div>
            <div className="edu-card">
              <h4>What kind of structure does it have?</h4>
              <p>{compound?.education?.structuralNature || 'A structural classification will be available after resolution.'}</p>
            </div>
            <div className="edu-card">
              <h4>What functional groups are present?</h4>
              <p>{selectedStructure.functionalGroups?.length ? selectedStructure.functionalGroups.map((group) => group.type).join(', ') : 'No recognized functional groups identified from the current data.'}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="compound-footer-grid">
        <section className="glass-panel lower-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Data source</p>
              <h3>Provenance</h3>
            </div>
          </div>
          <div className="source-list">
            <div><span>Source</span><strong>{compound?.source || 'Not available'}</strong></div>
            <div><span>Structure source</span><strong>{compound?.structureSource || 'Not available'}</strong></div>
            <div><span>3D status</span><strong>{compound?.structureType || 'Unavailable'}</strong></div>
            <div><span>Last retrieved</span><strong>{new Date().toLocaleString()}</strong></div>
          </div>
        </section>

        <section className="glass-panel lower-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Recently visualized</p>
              <h3>History</h3>
            </div>
          </div>
          <div className="history-list">
            {(history.length ? history : ['Benzene', 'Methanol', 'Caffeine']).map((entry) => (
              <button key={entry} className="history-item" onClick={() => loadCompound(entry)}>
                {entry}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </section>

        <section className="glass-panel lower-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Saved compounds</p>
              <h3>Favorites</h3>
            </div>
          </div>
          <div className="history-list">
            {(favorites.length ? favorites : ['Aspirin', 'Glucose']).map((entry) => (
              <button key={entry} className="history-item" onClick={() => loadCompound(entry)}>
                {entry}
                <Star size={14} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="bottom-actions">
        <button className="primary-button small" onClick={() => setNotice?.('Prepare for Docking is a future-ready workflow and is not yet active in this build.')}>
          <Beaker size={15} /> Prepare for Docking
        </button>
        <button className="quiet-button" onClick={() => setNotice?.('Comparison mode is reserved for future compound-side-by-side workflows.')}>
          <Activity size={15} /> Compare compounds
        </button>
      </div>
    </div>
  )
}
