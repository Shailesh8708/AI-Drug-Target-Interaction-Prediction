import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Atom, Check, FileUp, Focus, Layers3, Link2, MapPin, RotateCcw, Search, ShieldCheck, Upload, Waves } from 'lucide-react'
import { nearbyResidues, parseStructureText, proteinSummary } from '../../services/proteinModel'

const LazyProteinWebGLViewer = lazy(() => import('./ProteinWebGLViewer'))

const REPRESENTATIONS = [
  ['cartoon', 'Cartoon / ribbon'], ['backbone', 'Backbone'], ['ball-stick', 'Ball-and-stick'], ['surface', 'Surface'],
]
const CHAIN_COLORS = ['#ef7869', '#55a9bd', '#397654', '#d68b38', '#8f75b5', '#bd6388']

function ProteinCanvas(props) {
  return <Suspense fallback={<div className="protein-webgl-fallback"><strong>Loading GPU protein viewer...</strong><span>Preparing the molecular rendering engine.</span></div>}><LazyProteinWebGLViewer {...props} /></Suspense>
}

function LegacyProteinCanvas({ protein, representation, selectedResidue, onResidueSelect, visibleChains }) {
  const canvasRef = useRef(null)
  const boundsRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !protein.atoms.length) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width = 760
    const height = canvas.height = 430
    const visibleAtoms = protein.atoms.filter((atom) => visibleChains.has(atom.chainId))
    const min = visibleAtoms.reduce((result, atom) => ({ x: Math.min(result.x, atom.x), y: Math.min(result.y, atom.y), z: Math.min(result.z, atom.z) }), { x: Infinity, y: Infinity, z: Infinity })
    const max = visibleAtoms.reduce((result, atom) => ({ x: Math.max(result.x, atom.x), y: Math.max(result.y, atom.y), z: Math.max(result.z, atom.z) }), { x: -Infinity, y: -Infinity, z: -Infinity })
    const scale = Math.min(680 / Math.max(max.x - min.x, 1), 350 / Math.max(max.y - min.y, 1))
    const project = (atom) => ({ x: 40 + (atom.x - min.x) * scale, y: 215 - (atom.y - min.y) * scale })
    boundsRef.current = { project, visibleAtoms }
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0d1d1a'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = 'rgba(157, 204, 170, .12)'
    for (let x = 20; x < width; x += 34) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke() }
    for (let y = 20; y < height; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke() }
    const chainIndex = new Map(protein.chains.map((chain, index) => [chain.id, index]))
    const grouped = new Map()
    visibleAtoms.forEach((atom) => { if (!grouped.has(atom.chainId)) grouped.set(atom.chainId, []); grouped.get(atom.chainId).push(atom) })
    grouped.forEach((atoms, chainId) => {
      const color = CHAIN_COLORS[chainIndex.get(chainId) % CHAIN_COLORS.length]
      const residues = [...new Map(atoms.map((atom) => [atom.residueId, atom])).values()]
      ctx.strokeStyle = color
      ctx.lineWidth = representation === 'cartoon' ? 7 : representation === 'backbone' ? 3 : 1.3
      ctx.globalAlpha = representation === 'surface' ? .23 : .78
      ctx.beginPath()
      residues.forEach((atom, index) => { const point = project(atom); index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y) })
      ctx.stroke()
      if (representation !== 'cartoon' && representation !== 'backbone') atoms.forEach((atom) => { const point = project(atom); ctx.fillStyle = atom.record === 'HETATM' ? '#efaf65' : color; ctx.globalAlpha = representation === 'surface' ? .12 : .85; ctx.beginPath(); ctx.arc(point.x, point.y, representation === 'surface' ? 5 : 2.5, 0, Math.PI * 2); ctx.fill() })
    })
    ctx.globalAlpha = 1
    if (selectedResidue) {
      const selectedAtoms = visibleAtoms.filter((atom) => atom.residueId === selectedResidue)
      selectedAtoms.forEach((atom) => { const point = project(atom); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(point.x, point.y, 9, 0, Math.PI * 2); ctx.stroke() })
    }
    ctx.fillStyle = '#b6d6ba'
    ctx.font = '11px DM Mono, monospace'
    ctx.fillText(`${representation.toUpperCase()} · ${visibleAtoms.length.toLocaleString()} visible atoms`, 16, 24)
  }, [protein, representation, selectedResidue, visibleChains])

  const handleClick = (event) => {
    const canvas = canvasRef.current
    const state = boundsRef.current
    if (!canvas || !state) return
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height
    const nearest = state.visibleAtoms.reduce((best, atom) => { const point = state.project(atom); const distance = Math.hypot(point.x - x, point.y - y); return distance < best.distance ? { atom, distance } : best }, { atom: null, distance: 24 })
    if (nearest.atom) onResidueSelect(nearest.atom.residueId)
  }
  return <canvas ref={canvasRef} className="protein-canvas" onClick={handleClick} aria-label="Protein structure viewer" />
}

function ProteinInspector({ protein, selectedResidue, selectedLigand }) {
  const residue = protein.residues.find((item) => item.id === selectedResidue)
  const ligand = protein.ligands.find((item) => item.id === selectedLigand)
  if (residue) return <div className="protein-inspector-block"><div className="inspector-title"><MapPin size={15} /><strong>Residue Inspector</strong></div><div className="inspector-grid"><span>Residue<strong>{residue.name}</strong></span><span>Chain<strong>{residue.chainId}</strong></span><span>Position<strong>{residue.number}</strong></span><span>Atoms<strong>{residue.atomIds.length}</strong></span><span>Secondary structure<strong>{residue.secondaryStructure}</strong></span><span>Identity<strong>{residue.isStandard ? 'Standard amino acid' : 'Hetero residue'}</strong></span></div></div>
  if (ligand) return <div className="protein-inspector-block"><div className="inspector-title"><Link2 size={15} /><strong>Ligand Inspector</strong></div><div className="inspector-grid"><span>Identifier<strong>{ligand.name}</strong></span><span>Atoms<strong>{ligand.atomIds.length}</strong></span><span>Contacts<strong>Not configured</strong></span><span>Role<strong>Imported HETATM</strong></span></div></div>
  const summary = proteinSummary(protein)
  return <div className="protein-inspector-block"><div className="inspector-title"><Atom size={15} /><strong>Protein Profile</strong></div><div className="inspector-grid"><span>Structure ID<strong>{protein.metadata.structureId || 'Not available'}</strong></span><span>Chains<strong>{summary.chains}</strong></span><span>Residues<strong>{summary.residues}</strong></span><span>Atoms<strong>{summary.atoms}</strong></span><span>Ligands<strong>{summary.ligands}</strong></span><span>Method<strong>{protein.metadata.experimentalMethod || 'Not available'}</strong></span><span>Resolution<strong>{protein.metadata.resolution ? `${protein.metadata.resolution} A` : 'Not available'}</strong></span><span>Secondary structure<strong>{protein.secondaryStructure.available ? `${summary.helices} helices / ${summary.sheets} sheets` : 'Not available'}</strong></span></div></div>
}

export default function ProteinStudioPanel({ setNotice }) {
  const [protein, setProtein] = useState(() => ({ kind: 'protein', version: 1, name: 'No protein loaded', format: null, atoms: [], chains: [], residues: [], ligands: [], secondaryStructure: { helices: [], sheets: [], turns: [], available: false }, metadata: {}, validation: { status: 'empty', message: 'Import PDB text or upload a structure file.' } }))
  const [pdbText, setPdbText] = useState('')
  const [representation, setRepresentation] = useState('cartoon')
  const [selectedChain, setSelectedChain] = useState(null)
  const [selectedResidue, setSelectedResidue] = useState(null)
  const [selectedLigand, setSelectedLigand] = useState(null)
  const [visibleChains, setVisibleChains] = useState(new Set())
  const [bindingCutoff, setBindingCutoff] = useState(4)
  const fileRef = useRef(null)
  const summary = proteinSummary(protein)
  const nearby = selectedLigand ? nearbyResidues(protein, selectedLigand, bindingCutoff) : []

  const loadText = (text, name = 'Imported protein') => {
    try {
      const next = parseStructureText(text, 'auto', name)
      setProtein(next)
      setPdbText(text)
      setVisibleChains(new Set(next.chains.map((chain) => chain.id)))
      setSelectedChain(null); setSelectedResidue(null); setSelectedLigand(null)
      setNotice?.(`Loaded ${next.name} from ${next.format}`)
    } catch (error) { setProtein((current) => ({ ...current, validation: { status: 'invalid', message: error.message } })); setNotice?.('Protein structure could not be loaded') }
  }
  const loadFile = async (event) => { const file = event.target.files?.[0]; if (file) loadText(await file.text(), file.name) }
  const toggleChain = (id) => setVisibleChains((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  const focusChain = (chain) => { setSelectedChain(chain.id); setVisibleChains(new Set([chain.id])); setNotice?.(`Focused chain ${chain.id}`) }
  const dtiReady = protein.validation.status === 'valid'

  return <div className="protein-studio-shell"><div className="protein-import-card content-panel"><div><p className="eyebrow">Protein structure import</p><h3>Load a real PDB structure</h3><p className="field-help">Paste PDB text or choose a local file. mmCIF, domain annotation, contacts, and validated surface generation are explicit future processing services.</p></div><div className="protein-import-actions"><button className="outline-button" onClick={() => fileRef.current?.click()}><FileUp size={15} /> Upload PDB</button><input ref={fileRef} type="file" accept=".pdb,.ent,.txt" hidden onChange={loadFile} /><button className="primary-button small" onClick={() => loadText(pdbText)} disabled={!pdbText.trim()}><Upload size={15} /> Load structure</button></div><textarea className="protein-input" value={pdbText} onChange={(event) => setPdbText(event.target.value)} placeholder="Paste ATOM / HETATM PDB records here" aria-label="PDB structure input" /></div><div className="protein-studio-layout"><aside className="protein-sidebar content-panel"><div className="panel-heading"><div><p className="eyebrow">Structure hierarchy</p><h3>Chains</h3></div><span className={`studio-status ${protein.validation.status}`}>{protein.validation.status}</span></div>{protein.chains.length ? <div className="protein-chain-list">{protein.chains.map((chain) => <div className={`protein-chain-row ${selectedChain === chain.id ? 'selected' : ''}`} key={chain.id}><input type="checkbox" checked={visibleChains.has(chain.id)} onChange={() => toggleChain(chain.id)} aria-label={`Show chain ${chain.id}`} /><button onClick={() => focusChain(chain)}><strong>Chain {chain.id}</strong><small>{chain.residueIds.length} residues · {chain.atomIds.length} atoms</small></button></div>)}</div> : <div className="protein-empty"><Layers3 size={18} /><strong>No chains loaded</strong><span>Import a PDB structure to explore its hierarchy.</span></div>}<div className="studio-divider" /><p className="eyebrow">Representations</p><div className="protein-representation-list">{REPRESENTATIONS.map(([id, label]) => <button key={id} className={representation === id ? 'active' : ''} onClick={() => setRepresentation(id)}><Waves size={14} />{label}{id === 'surface' && <small>Engine pending</small>}</button>)}</div><button className="quiet-button protein-reset" onClick={() => { setVisibleChains(new Set(protein.chains.map((chain) => chain.id))); setSelectedChain(null) }}><RotateCcw size={14} /> Restore all chains</button></aside><main className="protein-main"><section className="protein-viewer content-panel"><div className="panel-heading compact"><div><p className="eyebrow">Coordinate structure view</p><h3>{protein.name}</h3></div><span className="draft-badge">{summary.atoms.toLocaleString()} atoms</span></div>{protein.atoms.length ? <ProteinCanvas protein={protein} representation={representation} selectedResidue={selectedResidue} onResidueSelect={setSelectedResidue} visibleChains={visibleChains} /> : <div className="protein-empty-view"><Atom size={24} /><strong>Awaiting an imported structure</strong><span>No protein coordinates are generated locally.</span></div>}<div className="protein-viewer-caption"><span>{protein.validation.message}</span><span>Selection: {selectedResidue || 'none'}</span></div></section><section className="protein-analysis content-panel"><div className="studio-tabs"><button className="active">Overview</button><button onClick={() => setSelectedResidue(selectedResidue ? null : protein.residues[0]?.id)}>Residues</button><button onClick={() => setSelectedLigand(selectedLigand ? null : protein.ligands[0]?.id)}>Ligands</button><button>Binding Site</button></div>{selectedLigand ? <div className="binding-site-panel"><div className="binding-site-header"><strong>Binding-site exploration</strong><span>Cutoff {bindingCutoff} A</span></div><label className="studio-field">Nearby residue cutoff<input type="range" min="2" max="8" step="0.5" value={bindingCutoff} onChange={(event) => setBindingCutoff(Number(event.target.value))} /></label>{nearby.length ? <div className="nearby-residue-list">{nearby.map((item) => <button key={item.residueId} onClick={() => setSelectedResidue(item.residueId)}><MapPin size={13} />{item.residueId}<strong>{item.distance} A</strong></button>)}</div> : <p className="field-help">No nearby residues are available at this cutoff.</p>}<p className="field-help">Proximity is a computed structural contact candidate, not proof of biological interaction.</p></div> : <div className="protein-summary-grid"><div><small>Chains</small><strong>{summary.chains}</strong></div><div><small>Residues</small><strong>{summary.residues}</strong></div><div><small>Helices</small><strong>{summary.helices || 'Not available'}</strong></div><div><small>Sheets</small><strong>{summary.sheets || 'Not available'}</strong></div><div><small>Ligands</small><strong>{summary.ligands}</strong></div><div><small>Contacts</small><strong>Not configured</strong></div></div>}</section></main><aside className="protein-inspector content-panel"><div className="panel-heading"><div><p className="eyebrow">Unified inspector</p><h3>{selectedResidue ? 'Residue selection' : selectedLigand ? 'Ligand selection' : 'Protein profile'}</h3></div><Search size={15} /></div><ProteinInspector protein={protein} selectedResidue={selectedResidue} selectedLigand={selectedLigand} /><div className="studio-divider" /><div className="protein-components"><p className="eyebrow">Components</p>{protein.ligands.length ? protein.ligands.map((ligand) => <button key={ligand.id} className={selectedLigand === ligand.id ? 'active' : ''} onClick={() => setSelectedLigand(selectedLigand === ligand.id ? null : ligand.id)}><input type="checkbox" checked={selectedLigand === ligand.id} readOnly /> {ligand.name} <small>{ligand.atomIds.length} atoms</small></button>) : <span className="field-help">No imported non-water ligands detected.</span>}</div><div className="protein-unavailable"><AlertTriangle size={16} /><strong>Structural contacts unavailable</strong><span>Hydrogen bonds, surfaces, distances, alignment, and DTI predictions require validated algorithms and coordinates.</span></div><button className="primary-button protein-dti-button" disabled={!dtiReady} onClick={() => { localStorage.setItem('aegis-dti-protein', JSON.stringify(protein)); setNotice?.('Protein staged for DTI pairing; model inference is not configured') }}><ShieldCheck size={15} /> Prepare for DTI</button></aside></div></div>
}
